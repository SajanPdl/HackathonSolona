import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const registerSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

const loginSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().optional(),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { walletAddress: data.walletAddress },
        ...(data.phone ? [{ phone: data.phone }] : []),
        ...(data.email ? [{ email: data.email }] : []),
      ]
    }
  });

  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const user = await prisma.user.create({
    data: {
      walletAddress: data.walletAddress,
      phone: data.phone,
      email: data.email,
    }
  });

  const token = generateToken(user.id, user.walletAddress, 'user');

  res.status(201).json({
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      phone: user.phone,
      email: user.email,
      kycStatus: user.kycStatus,
    },
    token
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  let user = await prisma.user.findUnique({
    where: { walletAddress: data.walletAddress }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { walletAddress: data.walletAddress }
    });
  }

  const token = generateToken(user.id, user.walletAddress, 'user');

  res.json({
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      phone: user.phone,
      email: user.email,
      kycStatus: user.kycStatus,
    },
    token
  });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    walletAddress: user.walletAddress,
    phone: user.phone,
    email: user.email,
    kycStatus: user.kycStatus,
  });
}));

export const authRouter = router;