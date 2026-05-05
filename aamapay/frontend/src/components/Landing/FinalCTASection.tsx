'use client';

import Link from 'next/link';
import { ArrowRight, Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function FinalCTASection() {
  return (
    <section className="py-20 bg-[#B91C1C]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Send Money to Nepal?
        </h2>
        <p className="text-red-100 mb-8 max-w-2xl mx-auto">
          Join thousands of families already using AamaPay. Connect your wallet and start transferring in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/send"
            className="bg-white text-[#B91C1C] px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet & Send
          </Link>
          <Link
            href="/claim"
            className="bg-transparent text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors border-2 border-white flex items-center gap-2"
          >
            Claim Money
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}