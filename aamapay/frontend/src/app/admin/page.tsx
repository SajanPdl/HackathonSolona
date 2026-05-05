'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Send, 
  DollarSign, 
  Shield, 
  Key, 
  Activity,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Wallet,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  status: string;
  currency: string;
  senderId: string;
  recipientIdentifier: string;
  createdAt: string;
}

interface User {
  id: string;
  walletAddress: string;
  phone: string | null;
  email: string | null;
  kycStatus: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  location: string;
  isVerified: boolean;
  totalPayouts: number;
  totalVolume: number;
  createdAt: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'transactions' | 'users' | 'agents'>('transactions');
  const [search, setSearch] = useState('');

  const transactionsQuery = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => api.transactions.list() as Promise<{ transactions: Transaction[] }>,
    refetchInterval: 5000,
  });

  const agentsQuery = useQuery({
    queryKey: ['admin-agents'],
    queryFn: () => apiRequest('/api/agents') as Promise<{ agents: Agent[] }>,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiRequest('/api/users') as Promise<{ users: User[] }>,
  });

  const filteredTransactions = transactionsQuery.data?.transactions.filter(tx => 
    !search || tx.id.includes(search) || tx.recipientIdentifier?.includes(search)
  ) || [];

  const filteredAgents = agentsQuery.data?.agents.filter(a =>
    !search || a.name.includes(search) || a.phone.includes(search)
  ) || [];

  const filteredUsers = usersQuery.data?.users.filter(u =>
    !search || u.walletAddress.includes(search) || u.phone?.includes(search)
  ) || [];

  const stats = {
    totalVolume: transactionsQuery.data?.transactions.reduce((sum, tx) => sum + tx.amount, 0) || 0,
    totalTransactions: transactionsQuery.data?.transactions.length || 0,
    pendingTransactions: transactionsQuery.data?.transactions.filter(tx => tx.status === 'PENDING').length || 0,
    totalUsers: usersQuery.data?.users.length || 0,
    totalAgents: agentsQuery.data?.agents.length || 0,
    verifiedAgents: agentsQuery.data?.agents.filter(a => a.isVerified).length || 0,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111827]">Admin Dashboard</h1>
          <p className="text-[#6B7280]">Manage transactions, users, and agents</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Total Volume" value={`$${stats.totalVolume.toFixed(2)}`} color="#B91C1C" />
          <StatCard icon={Send} label="Transactions" value={stats.totalTransactions.toString()} color="#6366F1" />
          <StatCard icon={Users} label="Users" value={stats.totalUsers.toString()} color="#16A34A" />
          <StatCard icon={Shield} label="Verified Agents" value={`${stats.verifiedAgents}/${stats.totalAgents}`} color="#F59E0B" />
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => setTab('transactions')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  tab === 'transactions' ? 'bg-[#B91C1C] text-white' : 'bg-[#F5F5F5] text-[#6B7280]'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setTab('users')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  tab === 'users' ? 'bg-[#B91C1C] text-white' : 'bg-[#F5F5F5] text-[#6B7280]'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setTab('agents')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  tab === 'agents' ? 'bg-[#B91C1C] text-white' : 'bg-[#F5F5F5] text-[#6B7280]'
                }`}
              >
                Agents
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F5F5F5] text-sm"
              />
            </div>
            <button
              onClick={() => {
                if (tab === 'transactions') transactionsQuery.refetch();
                if (tab === 'users') usersQuery.refetch();
                if (tab === 'agents') agentsQuery.refetch();
              }}
              className="p-2 rounded-xl border border-gray-200"
            >
              <RefreshCw className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {tab === 'transactions' && (
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Fee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Recipient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-[#111827]">{tx.id.substring(0, 12)}...</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">${tx.amount}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">${tx.fee}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{tx.recipientIdentifier || '-'}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'users' && (
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Wallet</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">KYC</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-[#111827]">{user.walletAddress.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{user.phone || '-'}</td>
                      <td className="px-4 py-3">
                        {user.kycStatus === 'APPROVED' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'agents' && (
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Verified</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Payouts</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">{agent.name}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{agent.phone}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{agent.location}</td>
                      <td className="px-4 py-3">
                        {agent.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{agent.totalPayouts}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">${agent.totalVolume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function apiRequest(endpoint: string) {
  const res = await fetch(`http://localhost:3001${endpoint}`);
  return res.json();
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">{label}</p>
          <p className="text-lg font-bold text-[#111827]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: '#FEF3C7', text: '#D97706' },
    CONFIRMED: { bg: '#DBEAFE', text: '#2563EB' },
    CLAIMED: { bg: '#D1FAE5', text: '#059669' },
    COMPLETED: { bg: '#D1FAE5', text: '#059669' },
    FAILED: { bg: '#FEE2E2', text: '#DC2626' },
  };
  const c = colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}