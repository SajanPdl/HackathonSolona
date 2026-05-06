import { PublicKey, Connection } from '@solana/web3.js';

export const ESCROW_SEED = 'escrow';
export const CLAIM_SEED = 'claim';

export let ProgramState: PublicKey;
export let AAMA_PAY_PROGRAM_ID: PublicKey;

let connection: Connection;

function parsePublicKey(input: string | undefined): PublicKey | null {
  if (!input || input.length < 32) return null;
  try {
    return new PublicKey(input);
  } catch {
    return null;
  }
}

export function initSolana(network: 'devnet' | 'mainnet' | 'testnet' = 'devnet'): Connection {
  const RPC_URL = {
    devnet: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    mainnet: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com',
  }[network];

  connection = new Connection(RPC_URL, 'confirmed');

  ProgramState = parsePublicKey(process.env.PROGRAM_STATE) || 
    new PublicKey('AamaPay1111111111111111111111111111111');
  AAMA_PAY_PROGRAM_ID = parsePublicKey(process.env.PROGRAM_ID) || 
    new PublicKey('AamaPay1111111111111111111111111111111');

  return connection;
}

export function getConnection(): Connection {
  if (!connection) {
    return initSolana(process.env.SOLANA_NETWORK as any || 'devnet');
  }
  return connection;
}

export async function derivePda(
  seed: string,
  extra?: string
): Promise<[PublicKey, number]> {
  const seeds = [Buffer.from(seed)];
  if (extra) {
    seeds.push(Buffer.from(extra));
  }

  try {
    const [pda, bump] = await PublicKey.findProgramAddress(
      seeds,
      AAMA_PAY_PROGRAM_ID
    );
    return [pda, bump];
  } catch {
    const dummy = PublicKey.default;
    return [dummy, 0];
  }
}

export async function getEscrowPda(claimCodeHash: string): Promise<[PublicKey, number]> {
  return derivePda(ESCROW_SEED, claimCodeHash);
}

export async function getClaimPda(claimCodeHash: string): Promise<[PublicKey, number]> {
  return derivePda(CLAIM_SEED, claimCodeHash);
}

export async function getOnChainState(
  claimCodeHash: string
): Promise<{ amount: number; bumps: { escrow: number; claim: number } } | null> {
  try {
    const [claimPda] = await getClaimPda(claimCodeHash);
    const conn = getConnection();
    
    const accountInfo = await conn.getAccountInfo(claimPda);
    if (!accountInfo) return null;

    const data = accountInfo.data;
    const amount = Number(data.readBigUInt64LE(8)) / 1e9;
    
    return {
      amount,
      bumps: { escrow: data[0], claim: data[1] },
    };
  } catch {
    return null;
  }
}

export async function verifyOnChainPayment(
  transactionSignature: string
): Promise<{ success: boolean; amount?: number; recipient?: string }> {
  try {
    const conn = getConnection();
    const tx = await conn.getParsedTransaction(transactionSignature, {
      commitment: 'confirmed',
    });

    if (!tx) {
      return { success: false };
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

export const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
export const PLATFORM_FEE_BPS = 25;
export const MIN_TRANSFER_AMOUNT = 0.001;
export const MAX_TRANSFER_AMOUNT = 100;