'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWeb3Auth, useSolanaTransaction } from '@/hooks/useWeb3Auth';
import toast, { Toaster } from 'react-hot-toast';
import {
  Wallet,
  CheckCircle,
  Loader2,
  ChevronRight,
  Shield,
  ArrowRight,
  Copy,
  Clock,
  Gift,
  Zap,
  ExternalLink,
} from 'lucide-react';

export default function ReceivePage() {
  const { connected, publicKey } = useWallet();
  const { authenticate, loading: authLoading } = useWeb3Auth();
  const { sendSol, loading: txLoading, confirmTransaction } = useSolanaTransaction();
  
  const [claimCode, setClaimCode] = useState('');
  const [step, setStep] = useState<'connect' | 'auth' | 'enter' | 'verify' | 'processing' | 'success'>('connect');
  const [verifiedTx, setVerifiedTx] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = async () => {
    if (!connected || !publicKey) return;
    
    setWalletAddress(publicKey.toBase58());
    setStep('auth');
    
    try {
      await authenticate();
      setStep('enter');
    } catch (error) {
      toast.error('Authentication failed');
    }
  };

  const handleVerify = async () => {
    if (!claimCode || claimCode.length < 6) {
      toast.error('Enter valid claim code');
      return;
    }

    setStep('processing');

    try {
      const response = await fetch(`/api/transactions/claim/${encodeURIComponent(claimCode)}`);
      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Invalid claim code');
      }

      setVerifiedTx(data);
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
      setStep('enter');
    }
  };

  const handleRedeem = async () => {
    if (!verifiedTx || !publicKey) return;

    setStep('processing');

    try {
      const response = await fetch(`/api/transactions/claim/${encodeURIComponent(claimCode)}/redeem`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Solana ${publicKey.toBase58()}:${Date.now()}`
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to redeem');
      }

      setStep('success');
      toast.success('SOL received!');
    } catch (error: any) {
      toast.error(error.message || 'Redemption failed');
      setStep('verify');
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Copied!');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-[#16A34A]" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              Received!
            </h1>
            <p className="text-[#6B7280] mb-8">
              {verifiedTx?.amount} SOL deposited to your wallet
            </p>

            <div className="bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/5 rounded-2xl p-6 mb-8">
              <p className="text-4xl font-bold text-[#16A34A]">
                {verifiedTx?.amount} SOL
              </p>
              <div className="flex items-center justify-center gap-2 text-sm mt-2">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">On-chain confirmed</span>
              </div>
            </div>

            <Link
              href="/"
              className="block w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing' || txLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-[#B91C1C] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Processing...</h2>
          <p className="text-[#6B7280]">Confirm transaction in wallet</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-[#16A34A]" />
            </div>

            <h1 className="text-2xl font-bold text-[#111827] mb-3">
              Receive SOL
            </h1>
            <p className="text-[#6B7280] mb-8">
              Connect wallet to receive SOL transfers
            </p>

            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-[#6B7280] mb-3">Need a wallet?</p>
              <div className="flex justify-center gap-4">
                <a href="https://phantom.app/" target="_blank" rel="noopener" className="text-[#B91C1C] font-medium text-sm">
                  Get Phantom <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'auth' || authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-8 h-8 text-[#B91C1C] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Authenticate</h2>
          <p className="text-[#6B7280]">Sign message in wallet</p>
        </div>
      </div>
    );
  }

  if (step === 'verify' && verifiedTx) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="mb-8">
            <button onClick={() => setStep('enter')} className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-[#16A34A]" />
              </div>
              <h2 className="text-xl font-bold text-[#111827]">Code Verified</h2>
              <p className="text-[#6B7280]">Ready to receive</p>
            </div>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <p className="text-4xl font-bold text-[#111827] text-center">
                {verifiedTx.amount} SOL
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-[#16A34A]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#16A34A]" />
              <p className="text-sm text-[#111827]">On-chain verified</p>
            </div>

            <button
              onClick={handleRedeem}
              disabled={txLoading}
              className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Claim to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
      <Toaster position="top-center" />

      <div className="max-w-lg mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Receive SOL</h1>
                <p className="text-green-100 text-sm">Direct to wallet</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'connect' && (
              <div className="text-center py-8">
                <p className="text-[#6B7280] mb-4">
                  Wallet connected. Click to continue.
                </p>
                <button
                  onClick={handleConnect}
                  className="bg-[#16A34A] text-white px-8 py-4 rounded-xl font-medium"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'enter' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Your Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl">
                    <p className="font-mono text-sm text-[#111827] truncate flex-1">
                      {publicKey?.toBase58().slice(0, 12)}...
                    </p>
                    <button type="button" onClick={copyAddress} className="p-2">
                      <Copy className="w-4 h-4 text-[#6B7280]" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Claim Code
                  </label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    placeholder="Enter 12-char code"
                    maxLength={12}
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-center text-xl font-mono tracking-widest"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={claimCode.length < 6}
                  className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Verify Code
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center">
            <Zap className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <p className="text-xs text-[#6B7280]">Instant</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <p className="text-xs text-[#6B7280]">Secure</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <p className="text-xs text-[#6B7280]">Web3</p>
          </div>
        </div>
      </div>
    </div>
  );
}