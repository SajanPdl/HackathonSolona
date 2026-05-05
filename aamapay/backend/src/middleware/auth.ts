import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  walletAddress?: string;
  role?: 'user' | 'agent';
}

const JWT_SECRET = process.env.JWT_SECRET || 'aamapay-secret-key-change-in-production';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      walletAddress: string;
      role: 'user' | 'agent';
    };

    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateToken = (userId: string, walletAddress: string, role: 'user' | 'agent') => {
  return jwt.sign({ userId, walletAddress, role }, JWT_SECRET, { expiresIn: '7d' });
};