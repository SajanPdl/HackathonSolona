import { Router } from 'express';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ users });
}));

export const userRouter = router;