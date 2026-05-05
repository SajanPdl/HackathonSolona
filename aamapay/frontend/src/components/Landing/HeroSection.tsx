'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#F5F5F5] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B91C1C]/10 text-[#B91C1C] rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powered by Solana Blockchain
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111827] leading-tight mb-6">
              Send money to Nepal
              <span className="text-[#B91C1C]"> instantly</span>
            </h1>
            
            <p className="text-lg text-[#6B7280] mb-8 max-w-lg">
              Transfer USDC to your family in Nepal. They receive cash from verified agents — fast, secure, and affordable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/send" className="bg-[#B91C1C] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2">
                Send Money
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/claim" className="bg-white text-[#111827] px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-2">
                Claim Money
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-[#111827]">$2M+</p>
                <p className="text-sm text-[#6B7280]">Transferred</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-[#111827]">15k+</p>
                <p className="text-sm text-[#6B7280]">Happy Families</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-[#111827]">500+</p>
                <p className="text-sm text-[#6B7280]">Active Agents</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#B91C1C]/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#B91C1C]" />
                </div>
                <div>
                  <p className="font-medium text-[#111827]">Quick Transfer</p>
                  <p className="text-sm text-[#6B7280]">Solana Devnet</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-[#6B7280] mb-1">You Send</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#111827]">$100</span>
                    <span className="text-sm text-[#6B7280]">USDC</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-[#B91C1C] rotate-90" />
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-green-600 mb-1">Recipient Gets</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#16A34A]">$99.50</span>
                    <span className="text-sm text-green-600">NPR Cash</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Fee</span>
                    <span className="text-[#111827] font-medium">$0.50 (0.5%)</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-[#6B7280]">Transfer Time</span>
                    <span className="text-[#111827] font-medium">~2 seconds</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-[#B91C1C] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
              No Hidden Fees
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}