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
  Clock,
  AlertCircle,
  Copy,
  ArrowRight,
  Key,
} from 'lucide-react';

export default function ClaimPage() {
  const { connected, publicKey } = useWallet();
  const { authenticate, loading: authLoading } = useWeb3Auth();
  const { sendSol, loading: txLoading } = useSolanaTransaction();
  
  const [claimCode, setClaimCode] = useState('');
  const [step, setStep] = useState<'connect' | 'enter' | 'verify' | 'processing' | 'success' | 'error'>('connect');
  const [verifiedTx, setVerifiedTx] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async () => {
    if (!claimCode || claimCode.length < 6) {
      toast.error('Please enter a valid claim code');
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
      setErrorMessage(error.message);
      setStep('error');
    }
  };

  const handleRedeem = async () => {
    if (!publicKey) {
      toast.error('Connect wallet first');
      return;
    }

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
      toast.success('Successfully redeemed!');
    } catch (error: any) {
      toast.error(error.message || 'Redemption failed');
      setStep('verify');
    }
  };

  const copyAmount = () => {
    if (verifiedTx?.amount) {
      navigator.clipboard.writeText(verifiedTx.amount.toString());
      toast.success('Copied!');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Claim Successful!</h1>
            <p className="text-[#6B7280] mb-8">
              SOL has been transferred to your wallet
            </p>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Amount Received</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {verifiedTx?.amount} SOL
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] flex items-center justify-center gap-2"
              >
                View Transaction
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/"
                className="block w-full bg-[#F5F5F5] text-[#111827] py-4 rounded-xl font-medium hover:bg-gray-200"
              >
                Back to Home
              </Link>
            </div>
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
          <p className="text-[#6B7280]">Please wait</p>
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

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Claim Code Verified</h1>
            <p className="text-[#6B7280] mb-6">Ready to claim</p>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6B7280]">Amount</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {verifiedTx.amount} SOL
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6B7280]">Sender</span>
                <span className="text-[#111827] font-mono text-sm">
                  {verifiedTx.sender?.slice(0, 6)}...{verifiedTx.sender?.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Expires</span>
                <span className="text-[#111827]">
                  {new Date(verifiedTx.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-[#16A34A]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#16A34A]" />
              <div>
                <p className="text-sm font-medium text-[#111827]">On-Chain Verified</p>
                <p className="text-xs text-[#6B7280]">Transaction confirmed</p>
              </div>
            </div>

            {!connected ? (
              <div className="space-y-3">
                <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
                <p className="text-sm text-[#6B7280]">Connect wallet to claim funds</p>
              </div>
            ) : (
              <button
                onClick={handleRedeem}
                disabled={txLoading}
                className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Claim to My Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="mb-8">
            <button onClick={() => setStep('enter')} className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Invalid Claim Code</h1>
            <p className="text-[#6B7280] mb-6">{errorMessage}</p>

            <button
              onClick={() => setStep('enter')}
              className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B]"
            >
              Try Another Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Claim SOL</h1>
            <p className="text-[#6B7280] mb-8">
              Enter claim code to receive SOL from sender
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
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
          <div className="bg-[#B91C1C] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Claim SOL</h1>
                <p className="text-red-200 text-sm">Enter your code</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-[#F5F5F5] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">Web3 Verification</p>
                <p className="text-xs text-[#6B7280]">On-chain claim validation</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Claim Code
              </label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="Enter 12-character code"
                maxLength={12}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent transition-all text-center text-xl font-mono tracking-widest uppercase"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={!claimCode || claimCode.length < 6}
              className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Verify Claim Code
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B91C1C]" />
            Claim Code Tips
          </h3>
          <div className="space-y-3 text-sm text-[#6B7280]">
            <p>•Codes are 12 characters (e.g., VM0OXICTDGKB)</p>
            <p>•Valid for 7 days from creation</p>
            <p>•Can only be used once</p>
          </div>
        </div>
      </div>
    </div>
  );
}