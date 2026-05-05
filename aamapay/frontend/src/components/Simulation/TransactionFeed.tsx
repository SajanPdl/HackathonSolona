import { useState, useEffect } from 'react';
import { useSimulation } from './SimulationProvider';
import { Transaction, TransactionStatus } from '@/lib/simulation/types';
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  Wallet,
  User,
  Copy,
  ExternalLink,
  QrCode
} from 'lucide-react';

const statusConfig: Record<TransactionStatus, { color: string; bg: string; icon: any }> = {
  CREATED: { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Loader2 },
  CONFIRMING: { color: 'text-orange-600', bg: 'bg-orange-100', icon: Loader2 },
  CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
  CLAIM_CODE_GENERATED: { color: 'text-purple-600', bg: 'bg-purple-100', icon: QrCode },
  REDEEMED: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  COMPLETED: { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
  EXPIRED: { color: 'text-red-600', bg: 'bg-red-100', icon: Clock },
};

export function TransactionFeed() {
  const { transactions, selectTransaction, selectedId } = useSimulation();
  const [filter, setFilter] = useState<TransactionStatus | 'ALL'>('ALL');

  const filteredTransactions = filter === 'ALL' 
    ? transactions 
    : transactions.filter(tx => tx.status === filter);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111827]">Live Transactions</h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A34A]"></span>
            </span>
            <span className="text-sm text-[#6B7280]">Live</span>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['ALL', 'PENDING', 'CONFIRMING', 'CLAIM_CODE_GENERATED', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === status 
                  ? 'bg-[#111827] text-white' 
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-[#6B7280]">Waiting for transactions...</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const config = statusConfig[tx.status];
            const Icon = config.icon;
            
            return (
              <button
                key={tx.id}
                onClick={() => selectTransaction(tx.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedId === tx.id ? 'bg-[#B91C1C]/5 border-l-4 border-[#B91C1C]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#111827]">{tx.senderName}</p>
                    <p className="text-xs text-[#6B7280]">→ {tx.recipientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#111827]">${tx.amount}</p>
                    <p className="text-xs text-[#6B7280]">${tx.fee.toFixed(2)} fee</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    <Icon className={`w-3 h-3 ${tx.status === 'PENDING' || tx.status === 'CONFIRMING' ? 'animate-spin' : ''}`} />
                    {tx.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {formatTimeAgo(tx.updatedAt)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function TransactionDetail() {
  const { transactions, selectedId, selectTransaction } = useSimulation();
  const tx = transactions.find(t => t.id === selectedId);

  if (!tx) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowRight className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-[#6B7280]">Select a transaction to view details</p>
      </div>
    );
  }

  const config = statusConfig[tx.status];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Transaction ID</p>
            <p className="font-mono font-bold">{tx.id}</p>
          </div>
          <button 
            onClick={() => selectTransaction(null)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
          {tx.status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#B91C1C]" />
              <span className="text-sm text-[#6B7280]">Amount</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">${tx.amount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#16A34A]" />
              <span className="text-sm text-[#6B7280]">Fee</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">${tx.fee.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Sender</span>
            </div>
            <span className="font-mono text-xs text-[#111827]">{tx.senderAddress.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Recipient</span>
            </div>
            <span className="font-medium text-[#111827]">{tx.recipientName}</span>
          </div>
          {tx.txHash && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm text-[#6B7280]">Tx Hash</span>
              </div>
              <span className="font-mono text-xs text-[#111827]">{tx.txHash.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {tx.claimCode && (
          <div className="p-4 bg-[#B91C1C]/5 border-2 border-[#B91C1C]/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#111827]">Claim Code</span>
              <button 
                onClick={() => navigator.clipboard.writeText(tx.claimCode!)}
                className="p-1 hover:bg-[#B91C1C]/10 rounded"
              >
                <Copy className="w-4 h-4 text-[#B91C1C]" />
              </button>
            </div>
            <p className="text-2xl font-mono font-bold text-[#B91C1C] tracking-wider">{tx.claimCode}</p>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-[#111827] mb-3">Timeline</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tx.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${i === tx.timeline.length - 1 ? 'bg-[#16A34A]' : 'bg-gray-300'}`} />
                  {i < tx.timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-[#111827]">{event.description}</p>
                  <p className="text-xs text-[#6B7280]">{formatTimeAgo(event.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}