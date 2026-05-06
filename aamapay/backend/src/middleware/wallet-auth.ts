import { Request, Response, NextFunction } from 'express';
import { PublicKey, Connection } from '@solana/web3.js';
import { verify } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import prisma from '../config/prisma.js';
import { getConnection } from '../utils/program-addresses.js';

export interface AuthWallet {
  address: string;
  publicKey: string;
  signature: string;
  message: string;
}

export interface WalletAuthRequest extends Request {
  wallet?: {
    address: string;
    publicKey: PublicKey;
  };
}

export function decodeBase58(encoded: string): Uint8Array {
  return bs58.decode(encoded);
}

export function verifySignature(
  publicKey: PublicKey,
  message: string,
  signature: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = decodeBase58(signature);
    const pubkeyBytes = publicKey.toBytes();

    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  } catch {
    return false;
  }
}

export function generateAuthMessage(walletAddress: string, nonce: string): string {
  return `Sign this message to authenticate with AamaPay.

Wallet: ${walletAddress}
Nonce: ${nonce}`;
}

export async function authenticateWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Solana ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Solana wallet signature required' 
      });
    }

    const [, credentials] = authHeader.split(' ');
    const [walletAddress, signature, timestamp] = credentials.split(':');

    if (!walletAddress || !signature || !timestamp) {
      return res.status(401).json({ 
        error: 'Invalid credentials format',
        message: 'Expected: Solana <address>:<signature>:<timestamp>' 
      });
    }

    const message = generateAuthMessage(walletAddress, timestamp);
    const publicKey = new PublicKey(walletAddress);

    if (!verifySignature(publicKey, message, signature)) {
      return res.status(401).json({ 
        error: 'Invalid signature',
        message: 'Wallet signature verification failed' 
      });
    }

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

    (req as WalletAuthRequest).wallet = {
      address: walletAddress,
      publicKey,
    };

    next();
  } catch (error) {
    console.error('Wallet auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Solana ')) {
    return next();
  }

  return authenticateWallet(req, res, next);
}

export async function getWalletBalance(
  walletAddress: string
): Promise<number> {
  try {
    const connection = getConnection();
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9;
  } catch {
    return 0;
  }
}

export async function verifyWalletOwnership(
  walletAddress: string,
  signature: string,
  nonce: string
): Promise<boolean> {
  const message = generateAuthMessage(walletAddress, nonce);
  const publicKey = new PublicKey(walletAddress);
  return verifySignature(publicKey, message, signature);
}