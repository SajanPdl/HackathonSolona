'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import toast, { Toaster } from 'react-hot-toast';
import {
  DollarSign,
  CheckCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Receipt,
  ArrowRight,
  AlertTriangle,
  QrCode,
  Store,
} from 'lucide-react';

export default function AgentPage() {
  const { connected, publicKey } = useWallet();
  const { authenticate, loading: authLoading } = useWeb3Auth();
  
  const [step, setStep] = useState<'connect' | 'auth' | 'dashboard'>('connect');
  const [claimCode, setClaimCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handleConnect = async () => {
    if (!connected) return;
    setStep('auth');
    
    try {
      await authenticate();
      setStep('dashboard');
    } catch (error) {
      toast.error('Authentication failed');
      setStep('connect');
    }
  };

  const handleVerify = async () => {
    if (!claimCode || claimCode.length < 6) {
      toast.error('Invalid claim code');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/transactions/claim/${encodeURIComponent(claimCode)}`);
      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Invalid claim code');
      }

      setVerifyResult(data);
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayout = async () => {
    if (!verifyResult) return;

    setProcessing(true);

    try {
      const response = await fetch(`/api/transactions/claim/${encodeURIComponent(claimCode)}/redeem`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Solana ${publicKey?.toBase58()}:${Date.now()}`
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payout failed');
      }

      toast.success('Payout completed!');
      setVerifyResult(null);
      setClaimCode('');
    } catch (error: any) {
      toast.error(error.message || 'Payout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Agent Portal</h1>
            <p className="text-[#6B7280] mb-8">
              Process cash payouts for customers
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link href="/agent/register" className="text-[#B91C1C] font-medium text-sm">
                Register as Agent →
              </Link>
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
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Authenticating</h2>
          <p className="text-[#6B7280]">Sign message in wallet</p>
        </div>
      </div>
    );
  }

  if (verifyResult) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-[#16A34A]" />
              </div>
              <h2 className="text-xl font-bold text-[#111827]">Code Verified</h2>
              <p className="text-[#6B7280]">Ready for payout</p>
            </div>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6B7280]">Amount</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {verifyResult.amount} SOL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Expires</span>
                <span className="text-[#111827]">
                  {new Date(verifyResult.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-[#16A34A]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#16A34A]" />
              <div>
                <p className="text-sm font-medium text-[#111827]">On-Chain Verified</p>
                <p className="text-xs text-[#6B7280]">Funds available</p>
              </div>
            </div>

            <button
              onClick={handlePayout}
              disabled={processing}
              className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Complete Payout
                </>
              )}
            </button>

            <button
              onClick={() => setVerifyResult(null)}
              className="w-full mt-3 text-[#6B7280] py-3"
            >
              Cancel
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

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="bg-[#16A34A] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agent Dashboard</h1>
                <p className="text-green-200 text-sm">Process payouts</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Scan Claim Code
              </label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="Enter 12-character code"
                maxLength={12}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all text-center text-xl font-mono tracking-widest uppercase"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={!claimCode || claimCode.length < 6 || processing}
              className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  Verify Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B91C1C]" />
            Today's Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
              <p className="text-2xl font-bold text-[#111827]">0</p>
              <p className="text-sm text-[#6B7280]">Payouts</p>
            </div>
            <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
              <p className="text-2xl font-bold text-[#111827]">0</p>
              <p className="text-sm text-[#6B7280]">SOL Paid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}