import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { derivePda, ProgramState, ClaimState, ESCROW_SEED, CLAIM_SEED } from './program-addresses.js';

export const MEMO_PROGRAM_ID = new PublicKey('Memo1oo1LqtJdpN3uKriZbmDkedUp2vH1TwJcX2Y1Bve');

export interface SendSolParams {
  sender: PublicKey;
  recipient: PublicKey;
  amount: number;
  memo?: string;
}

export async function sendSol(
  connection: Connection,
  params: SendSolParams
): Promise<string> {
  const { sender, recipient, amount, memo } = params;

  const instructions: TransactionInstruction[] = [
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: amount * 1e9,
    }),
  ];

  if (memo) {
    instructions.push(
      new TransactionInstruction({
        keys: [{ pubkey: sender, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, 'utf-8'),
        programId: MEMO_PROGRAM_ID,
      })
    );
  }

  const transaction = new Transaction().add(...instructions);
  return transaction;
}

export async function createEscrow(
  sender: PublicKey,
  amount: number,
  claimCodeHash: string
): Promise<TransactionInstruction> {
  const [escrowPda] = await derivePda(ESCROW_SEED, claimCodeHash);

  const data = Buffer.alloc(8 + 32);
  data.writeUInt8(0, 0);
  data.write(claimCodeHash, 1);

  return new TransactionInstruction({
    keys: [
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: escrowPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
    programId: ProgramState,
  });
}

export async function initializeClaim(
  initializer: PublicKey,
  recipient: PublicKey,
  amount: number,
  escrowBump: number,
  claimCodeHash: string
): Promise<TransactionInstruction> {
  const [claimPda] = await derivePda(CLAIM_SEED, claimCodeHash);

  const data = Buffer.alloc(1 + 1 + 32 + 1 + 8);
  data.writeUInt8(1, 0);
  data.writeUInt8(escrowBump, 1);
  recipient.toBuffer().copy(data, 2);
  data.writeUInt8(34, 34);
  data.writeBigUInt64LE(BigInt(amount * 1e9), 35);

  return new TransactionInstruction({
    keys: [
      { pubkey: initializer, isSigner: true, isWritable: true },
      { pubkey: claimPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
    programId: ProgramState,
  });
}

export async function redeemClaim(
  redeemer: PublicKey,
  claimCodeHash: string,
  claimBump: number
): Promise<TransactionInstruction> {
  const [claimPda] = await derivePda(CLAIM_SEED, claimCodeHash);

  const data = Buffer.alloc(1 + 1 + 32);
  data.writeUInt8(2, 0);
  data.writeUInt8(claimBump, 1);
  redeemer.toBuffer().copy(data, 2);

  return new TransactionInstruction({
    keys: [
      { pubkey: redeemer, isSigner: true, isWritable: true },
      { pubkey: claimPda, isSigner: false, isWritable: true },
    ],
    data,
    programId: ProgramState,
  });
}

export async function getEscrowState(
  connection: Connection,
  claimCodeHash: string
): Promise<{ amount: number; bumps: { escrow: number; claim: number } } | null> {
  const [claimPda] = await derivePda(CLAIM_SEED, claimCodeHash);

  try {
    const accountInfo = await connection.getAccountInfo(claimPda);
    if (!accountInfo) return null;

    const state = ClaimState.deserialize(accountInfo.data);
    return {
      amount: Number(state.amount) / 1e9,
      bumps: { escrow: state.escrowBump, claim: state.claimBump },
    };
  } catch {
    return null;
  }
}

export async function confirmTransaction(
  connection: Connection,
  signature: string,
  timeout: number = 30000
): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const tx = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
    });
    
    if (tx) {
      return tx.meta?.err === null;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}