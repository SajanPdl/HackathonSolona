'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { api } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';
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
  QrCode
} from 'lucide-react';

export default function ReceivePage() {
  const { connected, publicKey } = useWallet();
  const [claimCode, setClaimCode] = useState('');
  const [step, setStep] = useState<'connect' | 'enter' | 'verify' | 'success'>('connect');
  const [verifiedTx, setVerifiedTx] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (data: { claimCode: string }) => api.claims.verify(data) as Promise<any>,
    onSuccess: (data: any) => {
      if (data.valid) {
        setVerifiedTx(data.transaction);
        setStep('verify');
        gsap.fromTo('.verify-card', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
      } else {
        toast.error('Invalid or expired claim code');
      }
    },
    onError: () => {
      toast.error('Invalid or expired claim code');
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { claimCode: string; agentId: string }) => 
      api.claims.redeem(data, localStorage.getItem('aamapay_token')!) as Promise<any>,
    onSuccess: () => {
      setStep('success');
      toast.success('Transfer received! Check your wallet.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to redeem');
    },
  });

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
      const token = localStorage.getItem('aamapay_token');
      if (token) {
        setStep('enter');
      }
    }
  }, [connected, publicKey]);

  const handleConnect = async () => {
    if (connected && publicKey) {
      try {
        const token = localStorage.getItem('aamapay_token');
        if (!token) {
          const res = await api.auth.login({ walletAddress: publicKey.toString() }) as { token: string };
          localStorage.setItem('aamapay_token', res.token);
        }
        setStep('enter');
      } catch (error) {
        try {
          const res = await api.auth.register({ walletAddress: publicKey.toString() }) as { token: string };
          localStorage.setItem('aamapay_token', res.token);
          setStep('enter');
        } catch (err) {
          toast.error('Failed to connect wallet');
        }
      }
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimCode.length >= 6) {
      verifyMutation.mutate({ claimCode });
    }
  };

  const handleRedeem = () => {
    if (!verifiedTx) return;
    redeemMutation.mutate({ 
      claimCode, 
      agentId: 'direct-wallet' 
    });
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied!');
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
            
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Money Received!</h1>
            <p className="text-[#6B7280] mb-8">
              {verifiedTx?.amount} USDC has been deposited to your wallet
            </p>

            <div className="bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/5 rounded-2xl p-6 mb-8">
              <p className="text-sm text-[#6B7280] mb-1">Amount Received</p>
              <p className="text-4xl font-bold text-[#16A34A] mb-4">
                {verifiedTx?.amount} USDC
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Instant transfer complete</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
              >
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => {
                  setStep('enter');
                  setClaimCode('');
                  setVerifiedTx(null);
                }}
                className="w-full bg-[#F5F5F5] text-[#111827] py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Receive Another
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-[#111827] mb-4">Transaction Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Transfer ID</span>
                <span className="font-mono text-[#111827]">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">From</span>
                <span className="font-mono text-[#111827]">{verifiedTx?.senderAddress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Time</span>
                <span className="text-[#111827]">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Status</span>
                <span className="text-[#16A34A] font-medium">Completed</span>
              </div>
            </div>
          </div>
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
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Receive Money</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your wallet to receive USDC transfers directly
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-[#6B7280] mb-3">Don't have a wallet?</p>
              <div className="flex justify-center gap-4">
                <a href="https://phantom.app/" target="_blank" rel="noopener" className="text-[#B91C1C] font-medium text-sm hover:underline flex items-center gap-1">
                  Get Phantom <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-gray-300">|</span>
                <a href="https://solflare.com/" target="_blank" rel="noopener" className="text-[#B91C1C] font-medium text-sm hover:underline flex items-center gap-1">
                  Get Solflare <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
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
                <h1 className="text-xl font-bold">Receive Mode</h1>
                <p className="text-green-100 text-sm">Direct wallet deposit</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'connect' && (
              <div className="text-center py-8">
                <p className="text-[#6B7280] mb-4">Wallet connected. Click to continue.</p>
                <button
                  onClick={handleConnect}
                  className="bg-[#16A34A] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#15803D] transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'enter' && (
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Your Receiving Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-[#111827] truncate">
                        {walletAddress}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={copyAddress}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
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
                    placeholder="Enter claim code from sender"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-center text-xl font-mono tracking-widest"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-xl mb-6">
                  <Shield className="w-5 h-5 text-[#16A34A]" />
                  <p className="text-sm text-[#6B7280]">
                    Funds will be transferred directly to your wallet
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifyMutation.isPending || claimCode.length < 6}
                  className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Check Claim Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 'verify' && verifiedTx && (
              <div className="verify-card space-y-6">
                <div className="bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/5 border-2 border-[#16A34A]/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                    <span className="font-semibold text-[#16A34A]">Transfer Available!</span>
                  </div>
                  <p className="text-4xl font-bold text-[#111827] mb-2">
                    {verifiedTx.amount} USDC
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Clock className="w-4 h-4" />
                    <span>Expires in 24 hours</span>
                  </div>
                </div>

                <div className="bg-[#F5F5F5] rounded-2xl p-5">
                  <h3 className="font-semibold text-[#111827] mb-3">Transfer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Sender</span>
                      <span className="font-mono text-[#111827]">{verifiedTx.senderAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Receiving Address</span>
                      <span className="font-mono text-[#111827]">{walletAddress.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Fee</span>
                      <span className="text-[#16A34A]">None</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending}
                  className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {redeemMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Receiving...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Receive to My Wallet
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-[#6B7280]">
                  By receiving, you confirm the transfer details above
                </p>
              </div>
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
            <Dollar className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <p className="text-xs text-[#6B7280]">No Fees</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dollar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}