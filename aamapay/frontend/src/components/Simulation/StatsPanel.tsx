'use client';

import { useSimulation } from './SimulationProvider';
import { DollarSign, TrendingUp, Activity, Users, Clock } from 'lucide-react';

export function StatsPanel() {
  const { stats, transactions } = useSimulation();
  
  const recentVolume = transactions
    .filter(tx => tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-[#B91C1C]" />
        <h3 className="text-lg font-bold text-[#111827]">System Stats</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-[#B91C1C] to-[#991B1B] rounded-2xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">Total Volume</span>
            <DollarSign className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-2xl font-bold">${(stats.totalVolume / 1000000).toFixed(2)}M</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-[#6B7280]">Today</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">${recentVolume.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-[#6B7280]">Active</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">{stats.activeTransactions}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-[#6B7280]">Agents</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">{stats.totalAgents}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-[#6B7280]">Total TX</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">{stats.totalTransactions.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Success Rate</span>
            <span className="font-bold text-green-600">98.7%</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-[98.7%] bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6B7280]">Avg. Time</span>
          <span className="font-medium text-[#111827]">~12 seconds</span>
        </div>
      </div>
    </div>
  );
}