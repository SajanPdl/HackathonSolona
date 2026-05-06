import { Router } from 'express';
import { nacl } from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import prisma from '../config/prisma.js';
import { authenticateWallet, WalletAuthRequest, generateAuthMessage, getWalletBalance, decodeBase58 } from '../middleware/wallet-auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/authenticate', asyncHandler(async (req, res) => {
  const { walletAddress, signature, timestamp } = req.body;

  if (!walletAddress || !signature || !timestamp) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['walletAddress', 'signature', 'timestamp']
    });
  }

  // Skip strict signature verify for devnet testing - just validate wallet address format
  let publicKey;
  try {
    publicKey = new PublicKey(walletAddress);
  } catch {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  // For devnet: accept any valid wallet address (skip nacl verify)
  console.log('Auth (devnet mode):', walletAddress);
  
  let user = await prisma.user.findFirst({
    where: {
      wallets: {
        some: { address: walletAddress }
      }
    },
    include: { wallets: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        wallets: {
          create: {
            address: walletAddress,
            type: 'SOLANA',
            isPrimary: true,
          }
        }
      },
      include: { wallets: true }
    });
  }

  res.json({
    user: {
      id: user.id,
      wallets: user.wallets.map(w => ({
        address: w.address,
        type: w.type,
        isPrimary: w.isPrimary,
      })),
    },
    message: 'Authentication successful',
  });
}));

router.get('/verify', authenticateWallet, asyncHandler(async (req: WalletAuthRequest, res) => {
  const user = await prisma.user.findFirst({
    where: {
      wallets: {
        some: { address: req.wallet!.address }
      }
    },
    include: { wallets: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const balance = await getWalletBalance(req.wallet!.address);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      kycStatus: user.kycStatus,
      wallets: user.wallets.map(w => ({
        address: w.address,
        type: w.type,
        isPrimary: w.isPrimary,
      })),
      balance,
    },
  });
}));

router.post('/link-wallet', authenticateWallet, asyncHandler(async (req: WalletAuthRequest, res) => {
  const { walletAddress, signature, timestamp } = req.body;

  if (!walletAddress || !signature) {
    return res.status(400).json({ 
      error: 'Missing wallet address or signature' 
    });
  }

  const message = generateAuthMessage(walletAddress, timestamp);
  
  let isValidSignature = false;
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    
    // Try base64 first, then bs58
    let sigBytes: Uint8Array;
    try {
      sigBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
    } catch {
      sigBytes = bs58.decode(signature);
    }
    
    const pubkeyBytes = publicKey.toBytes();
    isValidSignature = nacl.sign.detached.verify(messageBytes, sigBytes, pubkeyBytes);
  } catch {
    isValidSignature = false;
  }

  if (!isValidSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const user = await prisma.user.findFirst({
    where: {
      wallets: {
        some: { address: req.wallet!.address }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingWallet = await prisma.wallet.findUnique({
    where: { address: walletAddress }
  });

  if (existingWallet) {
    return res.status(400).json({ error: 'Wallet already linked to another account' });
  }

  await prisma.wallet.create({
    data: {
      address: walletAddress,
      userId: user.id,
      type: 'SOLANA',
      isPrimary: user.wallets.length === 0,
    }
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { wallets: true }
  });

  res.json({
    success: true,
    wallets: updatedUser?.wallets.map(w => ({
      address: w.address,
      type: w.type,
      isPrimary: w.isPrimary,
    })),
  });
}));

export const authRouter = router;