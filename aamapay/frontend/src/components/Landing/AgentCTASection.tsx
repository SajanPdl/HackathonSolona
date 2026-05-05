'use client';

import Link from 'next/link';
import { Users, DollarSign, Shield, ArrowRight } from 'lucide-react';

export function AgentCTASection() {
  return (
    <section id="agents" className="py-20 bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              For Agents
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Become a Cash Agent
            </h2>

            <p className="text-gray-400 mb-8">
              Earn commissions on every transaction. Help your community access fast, affordable remittance services while building your business.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span>0.5% commission on every payout</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Secure, automated settlements</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>Growing customer base</span>
              </div>
            </div>

            <Link
              href="/agent/register"
              className="inline-flex items-center gap-2 bg-[#B91C1C] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
            >
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#B91C1C]" />
              </div>
              <div>
                <p className="text-white font-medium">Agent Dashboard</p>
                <p className="text-gray-400 text-sm">Real-time payout tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Total Payouts</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-[#16A34A]">$8,430</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Commission</p>
                <p className="text-2xl font-bold text-white">$42.15</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Rating</p>
                <p className="text-2xl font-bold text-white">4.9 ★</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}