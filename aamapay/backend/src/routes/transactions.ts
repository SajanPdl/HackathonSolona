import { Router } from 'express';
import { PublicKey, Connection, Transaction, SystemProgram } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { WalletAuthRequest, authenticateOptional, authenticateWallet, generateAuthMessage, getWalletBalance } from '../middleware/wallet-auth.js';
import { getConnection, getEscrowPda, getClaimPda, getOnChainState, DEFAULT_EXPIRY_SECONDS } from '../utils/program-addresses.js';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createHash } from 'crypto';

const router = Router();
const DEV_MODE = process.env.NODE_ENV !== 'production';

function hashClaimCode(code: string): string {
  return createHash('sha256').update(code).digest('hex').substring(0, 32);
}

router.post('/create', asyncHandler(async (req: WalletAuthRequest, res) => {
  const { recipientIdentifier, amount, agentId } = req.body;

  if (!amount || amount < 0.001) {
    return res.status(400).json({ error: 'Minimum amount is 0.001 SOL' });
  }

  // Extract wallet address from auth header or use dev fallback
  let senderAddress = req.wallet?.address;
  let senderPublicKey = req.wallet?.publicKey;
  
  if (!senderAddress || !senderPublicKey) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Solana ')) {
      const [, credentials] = authHeader.split(' ');
      const [address] = credentials.split(':');
      if (address) {
        try {
          senderAddress = address;
          senderPublicKey = new PublicKey(address);
        } catch {}
      }
    }
  }
  
  // Dev fallback if still no address
  if (!senderAddress || !senderPublicKey) {
    senderAddress = 'DYw8j4ToG6xRnFkpQq4FxKmJpHmhG1m78MhD2iJzRZm'; 
    senderPublicKey = new PublicKey('DYw8j4ToG6xRnFkpQq4FxKmJpHmhG1m78MhD2iJzRZm');
  }

  const balance = await getWalletBalance(senderAddress);
  const fee = Math.ceil(amount * 0.025 * 1000) / 1000;
  const total = amount + fee;

  if (balance < total) {
    return res.status(400).json({ 
      error: 'Insufficient funds',
      required: total,
      available: balance
    });
  }

  let recipient = null;
  let agent = null;

  if (agentId) {
    agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (agent) {
      recipient = { walletAddress: agent.walletAddress };
    }
  } else if (recipientIdentifier) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: recipientIdentifier },
          { email: recipientIdentifier }
        ]
      },
      include: {
        wallets: { where: { isPrimary: true } }
      }
    });

    if (existingUser?.wallets?.[0]) {
      recipient = { walletAddress: existingUser.wallets[0].address };
    }
  }

  const platformWallet = process.env.PLATFORM_WALLET 
    ? new PublicKey(process.env.PLATFORM_WALLET)
    : new PublicKey('AamaP6rqHeDrcNBxLg3f1KVVW2eT8YvJ3fXqX8YqX8YqX');

  let recipientPublicKey: PublicKey;
  if (recipient?.walletAddress) {
    recipientPublicKey = new PublicKey(recipient.walletAddress);
  } else {
    const [claimPda, claimBump] = await getClaimPda(hashClaimCode(''));
    recipientPublicKey = claimPda;
  }

  const connection = getConnection();
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: Math.floor(amount * 1e9),
    })
  );

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: platformWallet,
      lamports: Math.floor(fee * 1e9),
    })
  );

  const blockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash.blockhash;
  transaction.feePayer = senderPublicKey;

  const claimCode = generateClaimCode();
  const codeHash = hashClaimCode(claimCode);
  const expiry = new Date(Date.now() + DEFAULT_EXPIRY_SECONDS * 1000);

  const dbTransaction = await prisma.transaction.create({
    data: {
      senderId: senderAddress,
      recipientId: recipient?.walletAddress || null,
      recipientIdentifier,
      amount,
      fee,
      totalAmount: total,
      status: 'PENDING',
      claimCodeHash: codeHash,
      claimCodeExpiry: expiry,
    }
  });

  await prisma.claimCode.create({
    data: {
      transactionId: dbTransaction.id,
      codeHash,
      codePlain: claimCode,
      expiresAt: expiry,
    }
  });

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  res.status(201).json({
    transaction: {
      id: dbTransaction.id,
      amount,
      fee,
      totalAmount: total,
      status: 'PENDING',
      claimCode,
      claimCodeExpiry: expiry.toISOString(),
    },
    serializedTransaction: serialized.toString('base64'),
    recipient: recipientPublicKey.toBase58(),
  });
}));

router.post('/confirm', authenticateWallet, asyncHandler(async (req: WalletAuthRequest, res) => {
  const { transactionId, signature } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { claimCodes: true }
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.senderId !== req.wallet!.address) {
    return res.status(403).json({ error: 'Not the sender' });
  }

  const connection = getConnection();
  const tx = await connection.getParsedTransaction(signature, {
    commitment: 'confirmed'
  });

  if (!tx || tx.meta?.err) {
    return res.status(400).json({ error: 'Transaction not confirmed on-chain' });
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'COMPLETED',
      solanaTx: signature,
    }
  });

  res.json({ 
    success: true, 
    transactionId,
    signature 
  });
}));

router.get('/claim/:code', asyncHandler(async (req, res) => {
  const { code } = req.params;
  const codeHash = hashClaimCode(code);

  const claimCode = await prisma.claimCode.findUnique({
    where: { codeHash },
    include: {
      transaction: {
        include: {
          sender: { include: { wallets: true } }
        }
      }
    }
  });

  if (!claimCode) {
    return res.status(404).json({ error: 'Invalid claim code' });
  }

  if (claimCode.isUsed) {
    return res.status(400).json({ error: 'Claim code already used' });
  }

  if (new Date() > claimCode.expiresAt) {
    return res.status(400).json({ error: 'Claim code expired' });
  }

  const onChainState = await getOnChainState(codeHash);

  res.json({
    valid: true,
    amount: claimCode.transaction.amount,
    sender: claimCode.transaction.sender.wallets?.[0]?.address,
    expiresAt: claimCode.expiresAt,
    onChainVerified: !!onChainState,
  });
}));

router.post('/claim/:code/redeem', authenticateWallet, asyncHandler(async (req: WalletAuthRequest, res) => {
  const { code } = req.params;
  const codeHash = hashClaimCode(code);

  const claimCode = await prisma.claimCode.findUnique({
    where: { codeHash },
    include: { transaction: true }
  });

  if (!claimCode) {
    return res.status(404).json({ error: 'Invalid claim code' });
  }

  if (claimCode.isUsed) {
    return res.status(400).json({ error: 'Claim code already used' });
  }

  if (new Date() > claimCode.expiresAt) {
    return res.status(400).json({ error: 'Claim code expired' });
  }

  const connection = getConnection();
  const [claimPda] = await getClaimPda(codeHash);

  const transaction = new Transaction();
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: claimPda,
      toPubkey: req.wallet!.publicKey,
      lamports: Math.floor(claimCode.transaction.amount * 1e9),
    })
  );

  const blockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash.blockhash;
  transaction.feePayer = req.wallet!.publicKey;

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  await prisma.claimCode.update({
    where: { id: claimCode.id },
    data: { isUsed: true, usedAt: new Date() }
  });

  await prisma.transaction.update({
    where: { id: claimCode.transactionId },
    data: { status: 'CLAIMED' }
  });

  res.json({
    success: true,
    amount: claimCode.transaction.amount,
    serializedTransaction: serialized.toString('base64'),
  });
}));

function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const transactionRouter = router;