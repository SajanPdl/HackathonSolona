'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { connection } from '../context/WalletContext';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export interface AuthUser {
  id: string;
  wallets: Array<{
    address: string;
    type: string;
    isPrimary: boolean;
  }>;
}

export function useWeb3Auth() {
  const wallet = useWallet();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNonce = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const authenticate = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      setError('Wallet not connected or does not support signing');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const nonce = generateNonce();
      const message = `Sign this message to authenticate with AamaPay.

Wallet: ${wallet.publicKey.toBase58()}
Nonce: ${nonce}
Timestamp: ${Date.now()}`;

      const signature = await wallet.signMessage(new TextEncoder().encode(message));

      const signatureBase58 = Buffer.from(signature).toString('base64');

      const response = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toBase58(),
          signature: signatureBase58,
          timestamp: nonce,
        }),
      });

      console.log('Auth response:', response.status, await response.clone().json());
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setLoading(false);
      return null;
    }
  }, [wallet, generateNonce]);

  const getBalance = useCallback(async (): Promise<number> => {
    if (!wallet.publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(wallet.publicKey);
      return balance / 1e9;
    } catch {
      return 0;
    }
  }, [wallet.publicKey]);

  const disconnect = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    loading,
    error,
    authenticate,
    getBalance,
    disconnect,
  };
}

export function useSolanaTransaction() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSol = useCallback(async (recipient: string, amount: number) => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.sendTransaction) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const recipientPubkey = new PublicKey(recipient);
      
      const transaction = new Transaction();
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(amount * 1e9),
        })
      );

      const blockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await wallet.sendTransaction(signed, connection);

      setLoading(false);
      return signature;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setLoading(false);
      return null;
    }
  }, [wallet]);

  const confirmTransaction = useCallback(async (signature: string, timeout = 30000): Promise<boolean> => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const tx = await connection.getParsedTransaction(signature, {
          commitment: 'confirmed',
        });
        
        if (tx) {
          return tx.meta?.err === null;
        }
      } catch {
        // Continue polling
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }, []);

  return {
    sendSol,
    loading,
    error,
    confirmTransaction,
  };
}