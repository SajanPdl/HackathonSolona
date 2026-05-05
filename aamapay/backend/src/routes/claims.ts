import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyClaimCode } from '../utils/crypto.js';

const router = Router();

router.post('/generate', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { transactionId } = z.object({ transactionId: z.string() }).parse(req.body);

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { sender: true }
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.senderId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to generate claim code' });
  }

  if (transaction.status !== 'PENDING') {
    return res.status(400).json({ error: 'Transaction is not pending' });
  }

  res.json({
    message: 'Claim code already exists',
    claimCodeExpiry: transaction.claimCodeExpiry
  });
}));

router.post('/verify', asyncHandler(async (req, res) => {
  const { claimCode } = z.object({ claimCode: z.string() }).parse(req.body);

  const claimCodes = await prisma.claimCode.findMany({
    where: { isUsed: false },
    include: {
      transaction: {
        include: { sender: { select: { walletAddress: true } } }
      }
    }
  });

  for (const cc of claimCodes) {
    if (verifyClaimCode(claimCode, cc.codeHash) && cc.expiresAt > new Date()) {
      return res.json({
        valid: true,
        transaction: {
          id: cc.transaction.id,
          amount: cc.transaction.amount,
          currency: cc.transaction.currency,
          senderAddress: cc.transaction.sender.walletAddress.substring(0, 8) + '...',
          expiresAt: cc.expiresAt,
        }
      });
    }
  }

  res.status(400).json({ valid: false, error: 'Invalid or expired claim code' });
}));

router.post('/redeem', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { claimCode, agentId } = z.object({
    claimCode: z.string(),
    agentId: z.string(),
  }).parse(req.body);

  const agent = await prisma.agent.findUnique({
    where: { id: agentId }
  });

  if (!agent || !agent.isVerified) {
    return res.status(400).json({ error: 'Invalid or unverified agent' });
  }

  const claimCodes = await prisma.claimCode.findMany({
    where: { isUsed: false },
    include: { transaction: true }
  });

  let matchedClaimCode = null;
  for (const cc of claimCodes) {
    if (verifyClaimCode(claimCode, cc.codeHash) && cc.expiresAt > new Date()) {
      matchedClaimCode = cc;
      break;
    }
  }

  if (!matchedClaimCode) {
    return res.status(400).json({ error: 'Invalid or expired claim code' });
  }

  const transaction = matchedClaimCode.transaction;
  if (transaction.status !== 'PENDING') {
    return res.status(400).json({ error: 'Transaction is not available for redemption' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.claimCode.update({
      where: { id: matchedClaimCode!.id },
      data: { isUsed: true, usedAt: new Date() }
    });

    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'CLAIMED',
        recipientId: req.userId,
        redemptions: {
          create: {
            agentId,
            amount: transaction.amount,
            status: 'COMPLETED',
            completedAt: new Date()
          }
        }
      }
    });

    await tx.agent.update({
      where: { id: agentId },
      data: {
        totalPayouts: { increment: 1 },
        totalVolume: { increment: transaction.amount }
      }
    });
  });

  res.json({
    success: true,
    message: 'Claim redeemed successfully',
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency
    }
  });
}));

export const claimRouter = router;