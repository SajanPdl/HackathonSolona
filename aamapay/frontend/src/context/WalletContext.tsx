'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  WalletContextState,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  wallet: WalletContextState | null;
  connecting: boolean;
  disconnect: () => void;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const rpcUrl = network === 'devnet'
  ? 'https://api.devnet.solana.com'
  : 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(rpcUrl);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter()];
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/10 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-[#B91C1C]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <p className="text-[#6B7280] text-sm">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <SolanaWalletProvider wallets={wallets} autoConnect={false}>
      <WalletModalProvider>
        <WalletContextProvider>{children}</WalletContextProvider>
      </WalletModalProvider>
    </SolanaWalletProvider>
  );
}

function WalletContextProvider({ children }: { children: ReactNode }) {
  const wallet = useSolanaWallet();

  const value = useMemo<WalletContextType>(() => ({
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    wallet,
    connecting: wallet.connecting,
    disconnect: wallet.disconnect,
    signTransaction: wallet.signTransaction ? wallet.signTransaction.bind(wallet) : async (tx) => tx,
    sendTransaction: wallet.sendTransaction ? wallet.sendTransaction.bind(wallet) : async () => '',
  }), [wallet]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}