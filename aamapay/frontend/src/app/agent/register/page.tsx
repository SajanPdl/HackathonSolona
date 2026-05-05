'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { api } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';
import { 
  ArrowRight, 
  Loader2,
  ChevronRight,
  Users,
  Shield,
  CheckCircle,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export default function AgentRegisterPage() {
  const { connected, publicKey } = useWallet();
  const [step, setStep] = useState<'connect' | 'info' | 'form' | 'success'>('connect');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    location: '',
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => api.agents.register(data) as Promise<any>,
    onSuccess: (data: any) => {
      localStorage.setItem('aamapay_token', data.token);
      setStep('success');
      toast.success('Registration submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) return;

    if (!formData.name || !formData.phone || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    registerMutation.mutate({
      walletAddress: publicKey.toString(),
      ...formData,
    });
  };

  const benefits = [
    { icon: DollarSign, title: 'Earn Commission', desc: '0.5% on every payout' },
    { icon: Users, title: 'Grow Customer Base', desc: 'Access thousands of senders' },
    { icon: Shield, title: 'Secure settlements', desc: 'Auto-transfers via blockchain' },
  ];

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Application Submitted!</h1>
            <p className="text-[#6B7280] mb-8">
              Your agent application is under review. We'll verify your account within 24-48 hours.
            </p>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-[#111827] mb-3">What happens next?</h3>
              <div className="space-y-3 text-left">
                {[
                  'Account verification by our team',
                  'Business address confirmation',
                  'Welcome onboarding session',
                  'Start accepting payouts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                      <span className="text-[#16A34A] text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-sm text-[#6B7280]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="block w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
            >
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Link>
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
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Become an Agent</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your Phantom wallet to start the registration process
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8">
              <Link href="/" className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center justify-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Why Become an Agent?</h1>
            <p className="text-[#6B7280] mb-6">
              Join our network and earn commissions on every money transfer
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#B91C1C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111827]">{benefit.title}</h4>
                      <p className="text-sm text-[#6B7280]">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form' || step === 'connect') {
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
            <div className="bg-gradient-to-r from-[#B91C1C] to-[#991B1B] p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Agent Registration</h1>
                  <p className="text-red-200 text-sm">Complete your profile to apply</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <p className="text-sm text-[#6B7280]">Wallet: {publicKey?.toString().substring(0, 8)}...{publicKey?.toString().slice(-4)}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="As per ID"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent"
                      required
                    />
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Business Name (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Shop or store name"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent"
                    />
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent"
                      required
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2">
                    Business Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, District, Street"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent"
                      required
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#16A34A]/5 rounded-xl">
                  <Shield className="w-5 h-5 text-[#16A34A]" />
                  <p className="text-xs text-[#6B7280]">
                    Your information is encrypted and secure. We'll verify your business within 24-48 hours.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}