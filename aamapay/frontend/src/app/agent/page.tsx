'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@/context/WalletContext';
import gsap from 'gsap';
import { 
  DollarSign, 
  CheckCircle, 
  Loader2, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Receipt,
  ArrowRight,
  AlertTriangle,
  Check
} from 'lucide-react';

export default function AgentPage() {
  const { connected, publicKey, disconnect } = useWallet();
  const [step, setStep] = useState<'connect' | 'login' | 'dashboard'>('connect');
  const [claimCode, setClaimCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [recentPayouts, setRecentPayouts] = useState<any[]>([]);

  const loginMutation = useMutation({
    mutationFn: (data: { walletAddress: string }) => api.agents.login(data) as Promise<{ token: string }>,
    onSuccess: (data) => {
      localStorage.setItem('aamapay_token', data.token);
      setStep('dashboard');
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (data: { claimCode: string }) => api.claims.verify(data) as Promise<any>,
    onSuccess: (data: any) => {
      if (data.valid) {
        setVerifyResult(data.transaction);
        gsap.fromTo('.verify-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
      }
    },
    onError: () => {
      toast.error('Invalid claim code');
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { claimCode: string; agentId: string }) => 
      api.claims.redeem(data, localStorage.getItem('aamapay_token')!) as Promise<any>,
    onSuccess: () => {
      toast.success('Payout confirmed! Funds released.');
      setRecentPayouts(prev => [{
        amount: verifyResult.amount,
        sender: verifyResult.senderAddress,
        time: 'Just now'
      }, ...prev.slice(0, 4)]);
      setVerifyResult(null);
      setClaimCode('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Redemption failed');
    },
  });

  const agentQuery = useQuery({
    queryKey: ['agent', 'me'],
    queryFn: () => api.agents.me(localStorage.getItem('aamapay_token')!) as Promise<any>,
    enabled: step === 'dashboard',
  });

  useEffect(() => {
    if (connected && publicKey && step === 'connect') {
      loginMutation.mutate({ walletAddress: publicKey.toString() });
    }
  }, [connected, publicKey, step]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimCode.length >= 6) {
      verifyMutation.mutate({ claimCode });
    }
  };

  const handleConfirmPayout = () => {
    const agentId = agentQuery.data?.agent?.id || 'default-agent';
    redeemMutation.mutate({ claimCode, agentId });
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Agent Dashboard</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your Phantom wallet to access the agent dashboard
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link href="/agent/register" className="text-[#B91C1C] font-medium text-sm hover:underline">
                Want to become an agent? Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Agent Dashboard</h1>
            <p className="text-[#6B7280]">Process cash payouts securely</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Home
            </Link>
            <button 
              onClick={disconnect} 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-[#111827] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={DollarSign}
            label="Total Payouts"
            value={agentQuery.data?.agent?.totalPayouts || 0}
            color="#B91C1C"
          />
          <StatCard 
            icon={TrendingUp}
            label="Total Volume"
            value={`$${agentQuery.data?.agent?.totalVolume?.toFixed(2) || '0.00'}`}
            color="#16A34A"
          />
          <StatCard 
            icon={CheckCircle}
            label="Status"
            value={agentQuery.data?.agent?.isVerified ? 'Verified' : 'Pending'}
            color={agentQuery.data?.agent?.isVerified ? '#16A34A' : '#F59E0B'}
          />
          <StatCard 
            icon={Clock}
            label="Today"
            value={recentPayouts.length.toString()}
            subtitle="payouts"
            color="#6366F1"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="bg-[#111827] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Verify & Payout</h2>
                    <p className="text-gray-400 text-sm">Enter customer's claim code to process</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!verifyResult ? (
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-2">
                        Customer's Claim Code
                      </label>
                      <input
                        type="text"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                        placeholder="Enter claim code"
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent text-center text-xl font-mono tracking-widest"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-xl">
                      <Shield className="w-5 h-5 text-[#16A34A]" />
                      <p className="text-sm text-[#6B7280]">
                        Always verify cash handoff before releasing funds
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyMutation.isPending || claimCode.length < 6}
                      className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Verify Code
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="verify-card space-y-6">
                    <div className="bg-[#16A34A]/5 border-2 border-[#16A34A]/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                        <span className="font-semibold text-[#16A34A]">Valid Transaction</span>
                      </div>
                      <p className="text-4xl font-bold text-[#111827] mb-2">
                        {verifyResult.amount} USDC
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        From: {verifyResult.senderAddress}
                      </p>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-2xl p-5">
                      <h4 className="font-semibold text-[#111827] mb-3">Verification Checklist</h4>
                      <div className="space-y-3">
                        {[
                          'Customer verified identity',
                          'Cash handed to customer',
                          'Customer signed receipt',
                        ].map((item, i) => (
                          <label key={i} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                            <span className="text-sm text-[#111827]">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleConfirmPayout}
                        disabled={redeemMutation.isPending}
                        className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-medium hover:bg-[#15803D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {redeemMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            Confirm & Release Funds
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setVerifyResult(null);
                          setClaimCode('');
                        }}
                        className="w-full bg-[#F5F5F5] text-[#111827] py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-semibold text-[#111827] mb-4">Recent Payouts</h3>
              {recentPayouts.length > 0 ? (
                <div className="space-y-3">
                  {recentPayouts.map((payout, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                      <div>
                        <p className="font-medium text-[#111827]">{payout.amount} USDC</p>
                        <p className="text-xs text-[#6B7280]">{payout.time}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">No payouts yet today</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-semibold text-[#111827] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/agent/register" className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl hover:bg-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#B91C1C]" />
                    <span className="text-sm font-medium text-[#111827]">Update Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <button className="w-full flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl hover:bg-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#16A34A]" />
                    <span className="text-sm font-medium text-[#111827]">View Earnings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl hover:bg-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                    <span className="text-sm font-medium text-[#111827]">Report Issue</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-[#6B7280]">{label}</p>
          <p className="text-xl font-bold text-[#111827]">{value}</p>
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}