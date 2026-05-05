import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { walletAddress, email, phone, name } = z.object({
    walletAddress: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }).parse(req.body);

  let user = await prisma.user.findFirst({
    where: {
      wallets: { some: { address: walletAddress } }
    },
    include: { wallets: true }
  });

  if (user) {
    const existingWallet = user.wallets.find((w: any) => w.address === walletAddress);
    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet already linked' });
    }
    await prisma.wallet.create({
      data: { userId: user.id, address: walletAddress, isPrimary: user.wallets.length === 0 }
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        wallets: {
          create: { address: walletAddress, isPrimary: true }
        }
      },
      include: { wallets: true }
    });
  }

  const token = generateToken(user.id, walletAddress, 'user');
  res.json({ user: { id: user.id, email: user.email, phone: user.phone }, token });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { walletAddress } = z.object({ walletAddress: z.string() }).parse(req.body);

  let user = await prisma.user.findFirst({
    where: { wallets: { some: { address: walletAddress } } },
    include: { wallets: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        wallets: { create: { address: walletAddress, isPrimary: true } }
      },
      include: { wallets: true }
    });
  }

  const primaryWallet = user.wallets.find((w: any) => w.isPrimary) || user.wallets[0];
  const token = generateToken(user.id, primaryWallet?.address || walletAddress, 'user');
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      kycStatus: user.kycStatus,
      isVerified: user.isVerified,
      wallets: user.wallets.map((w: any) => ({ address: w.address, type: w.type, isPrimary: w.isPrimary }))
    },
    token
  });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findFirst({
    where: { wallets: { some: { address: req.walletAddress } } },
    include: { wallets: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    kycStatus: user.kycStatus,
    isVerified: user.isVerified,
    wallets: user.wallets.map((w: any) => ({ address: w.address, type: w.type, isPrimary: w.isPrimary }))
  });
}));

router.post('/update', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { email, phone, name } = z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }).parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { email, phone, name }
  });

  res.json({ success: true, user });
}));

export const authRouter = router;