'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { api } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Send, 
  CheckCircle, 
  Copy, 
  Loader2, 
  ArrowRight, 
  Wallet, 
  Shield, 
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';

export default function SendPage() {
  const { connected, publicKey } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'connect' | 'form' | 'processing' | 'success'>('connect');
  const [txData, setTxData] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: { recipientIdentifier: string; amount: number }) => {
      return api.transactions.create(data, localStorage.getItem('aamapay_token')!) as Promise<any>;
    },
    onSuccess: (data) => {
      setTxData(data);
      setStep('success');
      toast.success('Transfer initiated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create transaction');
      setStep('form');
    },
  });

  const registerUser = async (walletAddress: string) => {
    setIsRegistering(true);
    try {
      const response = await api.auth.login({ walletAddress }) as { token: string };
      localStorage.setItem('aamapay_token', response.token);
      setStep('form');
    } catch (error: any) {
      try {
        const response = await api.auth.register({ walletAddress }) as { token: string };
        localStorage.setItem('aamapay_token', response.token);
        setStep('form');
      } catch (err) {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (connected && publicKey) {
        const existingToken = localStorage.getItem('aamapay_token');
        if (!existingToken) {
          try {
            await registerUser(publicKey.toString());
          } catch (err) {
            console.error('Auth failed:', err);
          }
        } else {
          setStep('form');
        }
      }
    };
    initAuth();
  }, [connected, publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum < 1) {
      toast.error('Minimum transfer amount is 1 SOL');
      return;
    }

    setStep('processing');

    try {
      createMutation.mutate({
        recipientIdentifier: recipient,
        amount: amountNum,
      });
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setStep('form');
    }
  };

  const copyClaimCode = () => {
    if (txData?.transaction?.claimCode) {
      navigator.clipboard.writeText(txData.transaction.claimCode);
      toast.success('Claim code copied to clipboard!');
    }
  };

  const fee = (parseFloat(amount) || 0) * 0.005;
  const total = (parseFloat(amount) || 0) + fee;

  if (step === 'success' && txData) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Transfer Initiated!</h1>
            <p className="text-[#6B7280] mb-8">
              Your transaction is being processed on Solana blockchain
            </p>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6B7280]">Amount Sent</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {txData.transaction.amount} SOL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Fee</span>
                <span className="text-[#111827]">
                  {txData.transaction.fee} SOL
                </span>
              </div>
            </div>

            <div className="bg-[#B91C1C]/5 border-2 border-[#B91C1C]/20 rounded-2xl p-6 mb-6">
              <p className="text-sm text-[#6B7280] mb-3">Share this claim code with recipient</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-mono font-bold text-[#B91C1C] tracking-wider">
                  {txData.transaction.claimCode}
                </code>
                <button 
                  onClick={copyClaimCode} 
                  className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Copy className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280] mb-8">
              <Clock className="w-4 h-4" />
              <span>Expires: {new Date(txData.transaction.claimCodeExpiry).toLocaleDateString()}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
              >
                Send Another Transfer
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <Link 
                href="/"
                className="block w-full bg-[#F5F5F5] text-[#111827] py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#B91C1C]" />
              What's next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#B91C1C]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#B91C1C] font-medium text-xs">1</span>
                </div>
                <p className="text-sm text-[#6B7280]">Share the claim code with your recipient via SMS, WhatsApp, or any messaging app</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#B91C1C]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#B91C1C] font-medium text-xs">2</span>
                </div>
                <p className="text-sm text-[#6B7280]">Recipient visits a nearby agent with the code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#16A34A] font-medium text-xs">3</span>
                </div>
                <p className="text-sm text-[#6B7280]">Agent verifies and hands over cash. Funds released automatically!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-[#B91C1C] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Processing Transfer...</h2>
          <p className="text-[#6B7280]">Please wait while we confirm your transaction</p>
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
              <Wallet className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Connect Your Wallet</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your Phantom wallet to start sending money to Nepal
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-[#6B7280] mb-4">Don't have Phantom wallet?</p>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#B91C1C] font-medium text-sm hover:underline"
              >
                Download Phantom Wallet
              </a>
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
          <div className="bg-[#B91C1C] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Send Money</h1>
                <p className="text-red-200 text-sm">to Nepal</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-[#F5F5F5] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">Escrow Protection</p>
                <p className="text-xs text-[#6B7280]">Funds secured until delivery</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Recipient Identifier
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Phone number or email"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent transition-all text-[#111827]"
                />
                <p className="text-xs text-[#6B7280] mt-1.5">
                  Optional - helps recipient identify the sender
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Amount (SOL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3.5 pr-16 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent transition-all text-[#111827] text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">
                    SOL
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1.5">
                  Minimum: 1 SOL
                </p>
              </div>

              {amount && parseFloat(amount) >= 1 && (
                <div className="bg-[#F5F5F5] rounded-2xl p-5 mb-6">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#6B7280]">Amount</span>
                    <span className="text-[#111827] font-medium">{amount} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#6B7280]">Platform Fee (0.5%)</span>
                    <span className="text-[#111827]">{fee.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#6B7280]">Estimated Gas</span>
                    <span className="text-[#16A34A]">~$0.00025</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-[#111827] font-semibold">Total Cost</span>
                    <span className="text-[#B91C1C] font-bold text-lg">{total.toFixed(2)} SOL</span>
                  </div>
                </div>
              )}

<button
                  type="submit"
                  disabled={!amount || parseFloat(amount) < 1 || createMutation.isPending}
                  className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Send {amount ? `${amount} SOL` : ''}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
            </form>
          </div>

          <div className="px-6 pb-6">
            <div className="p-4 bg-[#F5F5F5] rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-[#6B7280] shrink-0 mt-0.5" />
              <p className="text-xs text-[#6B7280]">
                Recipient will receive a one-time claim code. They can withdraw cash from any verified AamaPay agent in Nepal.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-[#B91C1C]" />
            </div>
            <p className="text-xs text-[#6B7280]">Secure Escrow</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-[#B91C1C]" />
            </div>
            <p className="text-xs text-[#6B7280]">Instant Transfer</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
              <Send className="w-4 h-4 text-[#B91C1C]" />
            </div>
            <p className="text-xs text-[#6B7280]">0.5% Fee</p>
          </div>
        </div>
      </div>
    </div>
  );
}