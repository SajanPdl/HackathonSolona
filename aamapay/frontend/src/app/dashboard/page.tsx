'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@/context/WalletContext';
import gsap from 'gsap';
import { 
  Send, 
  DollarSign, 
  Clock, 
  CheckCircle,
  ChevronRight,
  Wallet,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  status: string;
  recipientName: string;
  claimCode: string | null;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: { status: string; timestamp: string; description: string }[];
}

export default function DashboardPage() {
  const { connected, publicKey, disconnect } = useWallet();
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'REDEEMED' | 'COMPLETED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const transactionsQuery = useQuery({
    queryKey: ['transactions', publicKey?.toString()],
    queryFn: () => api.transactions.list() as Promise<Transaction[]>,
    enabled: connected,
    refetchInterval: 10000,
  });

  const stats = {
    totalSent: transactionsQuery.data?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
    pending: transactionsQuery.data?.filter(tx => tx.status === 'PENDING' || tx.status === 'CONFIRMING').length || 0,
    completed: transactionsQuery.data?.filter(tx => tx.status === 'COMPLETED' || tx.status === 'REDEEMED').length || 0,
    totalFees: transactionsQuery.data?.reduce((sum, tx) => sum + tx.fee, 0) || 0,
  };

  const filteredTransactions = transactionsQuery.data?.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter;
    const matchesSearch = !searchQuery || 
      tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.claimCode?.includes(searchQuery.toUpperCase()) ||
      tx.id.includes(searchQuery);
    return matchesFilter && matchesSearch;
  }) || [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Claim code copied!');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'REDEEMED':
        return { bg: '#16A34A', text: '#16A34A', label: 'Completed' };
      case 'CONFIRMED':
      case 'CLAIM_CODE_GENERATED':
        return { bg: '#6366F1', text: '#6366F1', label: 'Ready for Pickup' };
      case 'CONFIRMING':
        return { bg: '#F59E0B', text: '#F59E0B', label: 'Confirming' };
      case 'PENDING':
        return { bg: '#F59E0B', text: '#F59E0B', label: 'Pending' };
      default:
        return { bg: '#6B7280', text: '#6B7280', label: status };
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-[#B91C1C]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#111827] mb-3">My Dashboard</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              Connect your wallet to track transfers, view history, and share claim codes
            </p>
            
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <Link href="/send" className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] hover:bg-gray-200 transition-colors">
                <span className="text-[#111827]">Send Money</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/claim" className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] hover:bg-gray-200 transition-colors">
                <span className="text-[#111827]">Claim Money</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
            <h1 className="text-2xl font-bold text-[#111827]">My Dashboard</h1>
            <p className="text-[#6B7280]">Track your transfers and share claim codes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => transactionsQuery.refetch()}
              className="p-2 bg-white rounded-xl border border-gray-200 text-[#6B7280] hover:text-[#111827]"
            >
              <RefreshCw className={`w-5 h-5 ${transactionsQuery.isFetching ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/" className="text-[#6B7280] hover:text-[#111827] text-sm flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Home
            </Link>
            <button 
              onClick={disconnect} 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-[#111827] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={DollarSign}
            label="Total Sent"
            value={formatAmount(stats.totalSent)}
            color="#B91C1C"
          />
          <StatCard 
            icon={Clock}
            label="Pending"
            value={stats.pending.toString()}
            subtitle="awaiting pickup"
            color="#F59E0B"
          />
          <StatCard 
            icon={CheckCircle}
            label="Completed"
            value={stats.completed.toString()}
            subtitle="successful"
            color="#16A34A"
          />
          <StatCard 
            icon={Activity}
            label="Fees Paid"
            value={formatAmount(stats.totalFees)}
            color="#6366F1"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#111827] mb-4">Transaction History</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by recipient or code..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {[('all'), ('PENDING'), ('CONFIRMED'), ('REDEEMED')].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          filter === f 
                            ? 'bg-[#B91C1C] text-white' 
                            : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-gray-200'
                        }`}
                      >
                        {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {transactionsQuery.isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C] mx-auto mb-3" />
                    <p className="text-[#6B7280]">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Send className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-[#6B7280] mb-4">No transactions found</p>
                    <Link href="/send" className="inline-flex items-center gap-2 px-4 py-2 bg-[#B91C1C] text-white rounded-xl text-sm font-medium">
                      <Send className="w-4 h-4" />
                      Send Money
                    </Link>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const statusStyle = getStatusColor(tx.status);
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/10 flex items-center justify-center">
                              <Send className="w-6 h-6 text-[#B91C1C]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#111827]">{tx.recipientName}</p>
                              <p className="text-sm text-[#6B7280]">
                                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#111827]">{formatAmount(tx.amount)}</p>
                            <span 
                              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${statusStyle.bg}15`,
                                color: statusStyle.text,
                              }}
                            >
                              {statusStyle.label}
                            </span>
                          </div>
                        </div>
                        {tx.claimCode && (
                          <div className="mt-3 flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl">
                            <span className="text-sm font-mono text-[#111827]">{tx.claimCode}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(tx.claimCode!);
                              }}
                              className="ml-auto p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="w-4 h-4 text-[#6B7280]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="font-semibold text-[#111827] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/send" className="flex items-center justify-between p-4 bg-[#B91C1C]/5 rounded-xl hover:bg-[#B91C1C]/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-[#B91C1C]" />
                    <span className="text-sm font-medium text-[#111827]">Send Money</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link href="/claim" className="flex items-center justify-between p-4 bg-[#6366F1]/5 rounded-xl hover:bg-[#6366F1]/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-[#6366F1]" />
                    <span className="text-sm font-medium text-[#111827]">Claim Money</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#B91C1C] to-[#991B1B] rounded-3xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-semibold">How it Works</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                  <span>Send SOL to Nepal instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                  <span>Share the claim code with recipient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
                  <span>Recipient picks up cash from agent</span>
                </li>
              </ol>
            </div>

            {selectedTx && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#111827]">Transaction Details</h3>
                  <button onClick={() => setSelectedTx(null)} className="text-[#6B7280] hover:text-[#111827]">
                    Close
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Amount</span>
                    <span className="font-medium text-[#111827]">{formatAmount(selectedTx.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Fee</span>
                    <span className="font-medium text-[#111827]">{formatAmount(selectedTx.fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Status</span>
                    <span className="font-medium" style={{ color: getStatusColor(selectedTx.status).text }}>
                      {getStatusColor(selectedTx.status).label}
                    </span>
                  </div>
                  {selectedTx.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B7280]">TX Hash</span>
                      <a
                        href={`https://solscan.io/tx/${selectedTx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#B91C1C] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-[#111827] mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedTx.timeline.map((event, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-[#16A34A] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#111827]">{event.description}</p>
                          <p className="text-xs text-[#6B7280]">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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