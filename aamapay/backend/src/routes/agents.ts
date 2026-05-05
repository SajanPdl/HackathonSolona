import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

const registerAgentSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  name: z.string().min(2),
  businessName: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  location: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerAgentSchema.parse(req.body);

  const existing = await prisma.agent.findFirst({
    where: {
      OR: [
        { walletAddress: data.walletAddress },
        { phone: data.phone }
      ]
    }
  });

  if (existing) {
    return res.status(400).json({ error: 'Agent already exists with this wallet or phone' });
  }

  const agent = await prisma.agent.create({
    data: {
      ...data,
      isVerified: false,
    }
  });

  res.status(201).json({
    agent: {
      id: agent.id,
      walletAddress: agent.walletAddress,
      name: agent.name,
      phone: agent.phone,
      isVerified: agent.isVerified,
    },
    token: generateToken(agent.id, agent.walletAddress, 'agent')
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { walletAddress } = z.object({ walletAddress: z.string() }).parse(req.body);

  let agent = await prisma.agent.findUnique({
    where: { walletAddress }
  });

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json({
    agent: {
      id: agent.id,
      walletAddress: agent.walletAddress,
      name: agent.name,
      phone: agent.phone,
      isVerified: agent.isVerified,
    },
    token: generateToken(agent.id, agent.walletAddress, 'agent')
  });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  if (req.role !== 'agent') {
    return res.status(403).json({ error: 'Agent access required' });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: req.userId }
  });

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json({
    id: agent.id,
    walletAddress: agent.walletAddress,
    name: agent.name,
    businessName: agent.businessName,
    phone: agent.phone,
    location: agent.location,
    isVerified: agent.isVerified,
    isActive: agent.isActive,
    totalPayouts: agent.totalPayouts,
    totalVolume: agent.totalVolume,
  });
}));

router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius = '10' } = req.query;

  let agents;
  if (lat && lng) {
    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    agents = await prisma.agent.findMany({
      where: {
        isVerified: true,
        isActive: true,
        lat: { gte: latNum - 0.1, lte: latNum + 0.1 },
        lng: { gte: lngNum - 0.1, lte: lngNum + 0.1 },
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        location: true,
        lat: true,
        lng: true,
        phone: true,
        totalPayouts: true,
      }
    });
  } else {
    agents = await prisma.agent.findMany({
      where: { isVerified: true, isActive: true },
      select: {
        id: true,
        name: true,
        businessName: true,
        location: true,
        phone: true,
        totalPayouts: true,
      }
    });
  }

  res.json({ agents });
}));

router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const agent = await prisma.agent.findUnique({
    where: { id: req.params.id }
  });

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json({
    id: agent.id,
    name: agent.name,
    businessName: agent.businessName,
    location: agent.location,
    phone: agent.phone,
    isVerified: agent.isVerified,
  });
}));

export const agentRouter = router;