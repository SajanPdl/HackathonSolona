'use client';

import { SimulationProvider } from '@/components/Simulation/SimulationProvider';
import { TransactionFeed } from '@/components/Simulation/TransactionFeed';
import { TransactionDetail } from '@/components/Simulation/TransactionFeed';
import { FlowVisualization } from '@/components/Simulation/FlowVisualization';
import { StatsPanel } from '@/components/Simulation/StatsPanel';
import { Wallet, Settings, Play, Pause } from 'lucide-react';

function SimulationDashboard() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B91C1C] flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <div>
                <h1 className="font-bold text-[#111827]">AamaPay</h1>
                <p className="text-xs text-[#6B7280]">Live Simulation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-700">Live</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#111827]">Live Dashboard</h2>
          <p className="text-[#6B7280] mt-1">Real-time transaction simulation powered by event-driven architecture</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TransactionFeed />
            <FlowVisualization />
          </div>
          <div className="space-y-6">
            <StatsPanel />
            <TransactionDetail />
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-[#111827] to-[#1F2937] rounded-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">System Architecture</h3>
              <p className="text-gray-400 text-sm">Event-driven simulation with real-time state management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                  <Wallet className="w-6 h-6" />
                </div>
                <p className="text-xs text-gray-400">Senders</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Events</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Agents</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <SimulationProvider>
      <SimulationDashboard />
    </SimulationProvider>
  );
}