'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
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
  ChevronRight
} from 'lucide-react';

export default function SendPage() {
  const { connected, publicKey } = useWallet();
  const { authenticate, getBalance, loading: authLoading } = useWeb3Auth();
  
  const [step, setStep] = useState<'connect' | 'auth' | 'form' | 'processing' | 'success'>('connect');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [txData, setTxData] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(false);

  // When wallet connects, go to auth step
  useEffect(() => {
    if (connected && step === 'connect') {
      setStep('auth');
    }
  }, [connected]);

  const fee = (parseFloat(amount) || 0) * 0.025;
  const total = (parseFloat(amount) || 0) + fee;

  // Step 1: Connect wallet
  if (step === 'connect') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Connect Wallet</h1>
            <p className="text-[#6B7280] mb-8">
              Connect Phantom to send SOL to Nepal
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-[#6B7280] mb-4">No Phantom?</p>
              <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-[#B91C1C] font-medium text-sm">
                Download Phantom
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Authorize (before showing form)
  if (step === 'auth') {
    const handleAuthorize = async () => {
      try {
        await authenticate();
        const bal = await getBalance();
        setBalance(bal);
        setStep('form');
      } catch (err: any) {
        toast.error(err.message || 'Authentication failed');
      }
    };

    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Authorize & Continue</h1>
            <p className="text-[#6B7280] mb-8">
              Sign message in wallet to continue
            </p>
            
            <button
              onClick={handleAuthorize}
              disabled={authLoading}
              className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Shield className="w-5 h-5" />
              Authorize & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Send form
  if (step === 'form') {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!publicKey) {
        toast.error('Wallet not connected');
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 0.001) {
        toast.error('Minimum amount is 0.001 SOL');
        return;
      }

      if (amountNum > balance) {
        toast.error('Insufficient balance');
        return;
      }

      setStep('processing');
      setTxLoading(true);

      try {
        const response = await fetch('/api/transactions/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Solana ${publicKey.toBase58()}:${Date.now()}`
          },
          body: JSON.stringify({
            amount: amountNum,
            recipientIdentifier: recipient,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed');
        }

        setTxData(data);
        setStep('success');
      } catch (err: any) {
        toast.error(err.message || 'Transaction failed');
        setStep('form');
      } finally {
        setTxLoading(false);
      }
    };

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
                  <h1 className="text-xl font-bold">Send SOL</h1>
                  <p className="text-red-200 text-sm">to Nepal</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center gap-3 mb-6 p-4 bg-[#F5F5F5] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#B91C1C]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Web3 Protected</p>
                  <p className="text-xs text-[#6B7280]">On-chain verification</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Recipient Phone / Wallet
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="9800000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none text-2xl font-semibold"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]">SOL</span>
                  </div>
                </div>

                {amount && (
                  <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Amount</span>
                      <span className="font-medium">{amount} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Fee (2.5%)</span>
                      <span className="font-medium">{fee.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-[#6B7280]">Total</span>
                      <span className="font-bold">{total.toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!amount || !recipient || txLoading}
                className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {txLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send SOL
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <p className="text-xs text-[#6B7280]">Escrow</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <p className="text-xs text-[#6B7280]">Instant</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-2">
                <Send className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <p className="text-xs text-[#6B7280]">2.5% Fee</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Processing
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-[#B91C1C] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Confirm in Wallet...</h2>
          <p className="text-[#6B7280]">Sign the transaction in Phantom</p>
        </div>
      </div>
    );
  }

  // Step 5: Success
  if (step === 'success' && txData) {
    const copyCode = () => {
      if (txData?.transaction?.claimCode) {
        navigator.clipboard.writeText(txData.transaction.claimCode);
        toast.success('Copied!');
      }
    };

    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-2">Transfer Complete!</h1>
            <p className="text-[#6B7280] mb-8">
              Your transaction confirmed on Solana blockchain
            </p>

            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6B7280]">Amount</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {txData.transaction?.amount || amount} SOL
                </span>
              </div>
            </div>

            {txData.transaction?.claimCode && (
              <div className="bg-[#B91C1C]/5 border-2 border-[#B91C1C]/20 rounded-2xl p-6 mb-6">
                <p className="text-sm text-[#6B7280] mb-3">Claim Code</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-[#B91C1C]">
                    {txData.transaction.claimCode}
                  </code>
                  <button onClick={copyCode} className="p-2 hover:bg-gray-100 rounded-xl">
                    <Copy className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#B91C1C] text-white py-4 rounded-xl font-medium hover:bg-[#991B1B] flex items-center justify-center gap-2"
            >
              Send Another
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}