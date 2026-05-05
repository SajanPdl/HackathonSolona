import { createHash, randomBytes } from 'crypto';

const CLAIM_CODE_LENGTH = 12;
const CLAIM_CODE_EXPIRY_HOURS = 24;

export const generateClaimCode = (): string => {
  return randomBytes(CLAIM_CODE_LENGTH)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .substring(0, CLAIM_CODE_LENGTH)
    .toUpperCase();
};

export const hashClaimCode = (code: string): string => {
  return createHash('sha256').update(code).digest('hex');
};

export const getClaimCodeExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + CLAIM_CODE_EXPIRY_HOURS);
  return expiry;
};

export const verifyClaimCode = (inputCode: string, storedHash: string): boolean => {
  const inputHash = hashClaimCode(inputCode);
  return inputHash === storedHash;
};

export const calculateFee = (amount: number): { fee: number; total: number } => {
  const FEE_PERCENT = 0.5;
  const fee = amount * (FEE_PERCENT / 100);
  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round((amount + fee) * 100) / 100
  };
};

export const generateTransactionId = (): string => {
  return `AAP${Date.now()}${randomBytes(2).toString('hex').toUpperCase()}`;
};