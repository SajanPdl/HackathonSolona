import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateFee, generateTransactionId, generateClaimCode, hashClaimCode, getClaimCodeExpiry } from '../utils/crypto.js';

const router = Router();

const createTransactionSchema = z.object({
  recipientIdentifier: z.string().optional(),
  amount: z.number().positive(),
});

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const data = createTransactionSchema.parse(req.body);
  const { fee, total } = calculateFee(data.amount);

  const txId = generateTransactionId();

  let recipient = null;
  if (data.recipientIdentifier) {
    recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: data.recipientIdentifier },
          { email: data.recipientIdentifier },
          { walletAddress: data.recipientIdentifier }
        ]
      }
    });
  }

  const transaction = await prisma.transaction.create({
    data: {
      id: txId,
      senderId: req.userId!,
      recipientId: recipient?.id,
      recipientIdentifier: data.recipientIdentifier,
      amount: data.amount,
      fee,
      totalAmount: total,
      status: 'PENDING',
    }
  });

  const claimCode = generateClaimCode();
  const claimCodeHash = hashClaimCode(claimCode);
  const expiry = getClaimCodeExpiry();

  await prisma.claimCode.create({
    data: {
      transactionId: transaction.id,
      codeHash: claimCodeHash,
      codePlain: claimCode,
      expiresAt: expiry,
    }
  });

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      claimCodeHash,
      claimCodeExpiry: expiry,
    }
  });

  res.status(201).json({
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      fee: transaction.fee,
      totalAmount: transaction.totalAmount,
      status: transaction.status,
      claimCode,
      claimCodeExpiry: expiry,
    },
    recipient: recipient ? {
      id: recipient.id,
      phone: recipient.phone,
    } : null
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: {
      sender: { select: { id: true, walletAddress: true } },
      recipient: { select: { id: true, walletAddress: true, phone: true } },
      redemptions: { include: { agent: true } },
    }
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const isOwner = transaction.senderId === req.userId || transaction.recipientId === req.userId;

  if (!isOwner) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({
    id: transaction.id,
    amount: transaction.amount,
    fee: transaction.fee,
    totalAmount: transaction.totalAmount,
    status: transaction.status,
    solanaTx: transaction.solanaTx,
    createdAt: transaction.createdAt,
    redemptions: transaction.redemptions,
  });
}));

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { status, type } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (type === 'sent') where.senderId = req.userId;
  if (type === 'received') where.recipientId = req.userId;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ transactions });
}));

export const transactionRouter = router;