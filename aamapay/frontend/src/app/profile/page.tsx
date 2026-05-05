'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { api } from '@/utils/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { 
  Wallet, 
  Send, 
  ArrowDownLeft, 
  Plus, 
  Copy, 
  Check, 
  Mail, 
  Phone,
  Eye,
  EyeOff,
  Shield,
  Transaction,
  LogOut,
  ChevronRight,
  Loader2,
  X,
  User
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  kycStatus: string;
  isVerified: boolean;
  wallets: { address: string; type: string; isPrimary: boolean }[];
}

interface TransactionItem {
  id: string;
  amount: number;
  fee: number;
  status: string;
  recipientIdentifier: string | null;
  senderId: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { connected, publicKey, disconnect } = useWallet();
  const [addWalletMode, setAddWalletMode] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendStep, setSendStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [selectedTab, setSelectedTab] = useState<'sent' | 'received' | 'wallets'>('sent');

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('aamapay_token');
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      handleLogin(publicKey.toString());
    }
  }, [connected, publicKey]);

  const handleLogin = async (walletAddress: string) => {
    try {
      const res = await api.auth.login({ walletAddress }) as { token: string };
      localStorage.setItem('aamapay_token', res.token);
      setToken(res.token);
      profileQuery.refetch();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => api.auth.me(token!) as Promise<UserProfile>,
    enabled: !!token,
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', token],
    queryFn: () => api.transactions.list('', token!) as Promise<{ transactions: TransactionItem[] }>,
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { email?: string; phone?: string; name?: string }) => 
      apiRequest('/api/profile/update', { method: 'POST', body: data, token: token! }),
    onSuccess: () => {
      toast.success('Profile updated!');
      profileQuery.refetch();
    },
    onError: () => {
      toast.error('Update failed');
    }
  });

  const addWalletMutation = useMutation({
    mutationFn: (data: { walletAddress: string }) => 
      apiRequest('/api/wallets/add', { method: 'POST', body: data, token: token! }),
    onSuccess: () => {
      toast.success('Wallet added!');
      profileQuery.refetch();
      setAddWalletMode(false);
    },
    onError: () => {
      toast.error('Failed to add wallet');
    }
  });

  const sendMutation = useMutation({
    mutationFn: (data: { recipientIdentifier: string; amount: number }) => 
      api.transactions.create(data, token!) as Promise<any>,
    onSuccess: (data) => {
      toast.success('Transaction sent!');
      setSendStep('success');
      transactionsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Send failed');
    }
  });

  const handleAddWallet = () => {
    if (addWalletMode && publicKey) {
      addWalletMutation.mutate({ walletAddress: publicKey.toString() });
    } else {
      setAddWalletMode(!addWalletMode);
    }
  };

  const handleLinkEmail = () => {
    if (linkEmail) {
      updateMutation.mutate({ email: linkEmail });
    }
  };

  const handleLinkPhone = () => {
    if (linkPhone) {
      updateMutation.mutate({ phone: linkPhone });
    }
  };

  const handleSend = () => {
    if (sendAmount && sendRecipient) {
      sendMutation.mutate({ 
        recipientIdentifier: sendRecipient, 
        amount: parseFloat(sendAmount) 
      });
    }
  };

  const primaryWallet = profileQuery.data?.wallets?.find(w => w.isPrimary);
  const sentTxs = transactionsQuery.data?.transactions?.filter(t => t.senderId === profileQuery.data?.id) || [];
  const receivedTxs = transactionsQuery.data?.transactions?.filter(t => t.senderId !== profileQuery.data?.id) || [];

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pt-20">
        <Toaster position="top-center" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-[#B91C1C]" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mb-3">My Profile</h1>
            <p className="text-[#6B7280] mb-8">Connect your wallet to access your dashboard</p>
            <WalletMultiButton className="!bg-[#B91C1C] !hover:bg-[#991B1B] !rounded-xl !w-full !justify-center !py-4" />
            <Link href="/" className="block mt-6 text-[#B91C1C] text-sm">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20 pb-12">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">My Profile</h1>
          <button onClick={disconnect} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827]">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#B91C1C] flex items-center justify-center text-white text-xl font-bold">
              {profileQuery.data?.name?.[0] || publicKey?.toString()[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">{profileQuery.data?.name || 'User'}</h2>
              <p className="text-sm text-[#6B7280] flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {profileQuery.data?.isVerified ? 'Verified' : profileQuery.data?.kycStatus || 'Unverified'}
              </p>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-[#6B7280]">Email</label>
                {profileQuery.data?.email ? (
                  <p className="flex items-center gap-2 text-[#111827]">
                    {showEmail ? profileQuery.data.email : '••••@••••.com'}
                    <button onClick={() => setShowEmail(!showEmail)} className="text-[#6B7280]">
                      {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      placeholder="Link your email"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-[#F5F5F5]"
                    />
                    <button onClick={handleLinkEmail} className="px-4 py-2 bg-[#B91C1C] text-white rounded-xl">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="text-sm text-[#6B7280]">Phone</label>
                {profileQuery.data?.phone ? (
                  <p className="flex items-center gap-2 text-[#111827]">
                    {showPhone ? profileQuery.data.phone : '••••••••••'}
                    <button onClick={() => setShowPhone(!showPhone)} className="text-[#6B7280]">
                      {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={linkPhone}
                      onChange={(e) => setLinkPhone(e.target.value)}
                      placeholder="Link phone"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-[#F5F5F5]"
                    />
                    <button onClick={handleLinkPhone} className="px-4 py-2 bg-[#B91C1C] text-white rounded-xl">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wallets */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#111827]">My Wallets</h3>
            <button onClick={handleAddWallet} className="flex items-center gap-2 text-[#B91C1C] text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Wallet
            </button>
          </div>
          <div className="space-y-2">
            {profileQuery.data?.wallets?.map((wallet, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#6B7280]" />
                  <span className="font-mono text-sm">{wallet.address.substring(0, 8)}...</span>
                  {wallet.isPrimary && (
                    <span className="px-2 py-0.5 bg-[#B91C1C]/10 text-[#B91C1C] text-xs rounded-full">Primary</span>
                  )}
                </div>
                <span className="text-sm text-[#6B7280]">{wallet.type}</span>
              </div>
            ))}
            {!profileQuery.data?.wallets?.length && (
              <p className="text-[#6B7280] text-sm">Connect a wallet to get started</p>
            )}
          </div>
        </div>

        {/* Send Money */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-[#111827] mb-4">Send Money</h3>
          {sendStep === 'success' ? (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="font-bold text-[#111827]">Transaction Sent!</p>
              <button onClick={() => setSendStep('form')} className="mt-4 text-[#B91C1C]">Send Another</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="Amount in SOL"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F5F5F5]"
              />
              <input
                type="text"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder="Recipient wallet, email, or phone"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F5F5F5]"
              />
              <button 
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="w-full py-3 bg-[#B91C1C] text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Send SOL
              </button>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4 overflow-x-auto">
            <button
              onClick={() => setSelectedTab('sent')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                selectedTab === 'sent' ? 'bg-[#B91C1C] text-white' : 'bg-[#F5F5F5] text-[#6B7280]'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setSelectedTab('received')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                selectedTab === 'received' ? 'bg-[#B91C1C] text-white' : 'bg-[#F5F5F5] text-[#6B7280]'
              }`}
            >
              Received
            </button>
          </div>

          <div className="space-y-2">
            {(selectedTab === 'sent' ? sentTxs : receivedTxs).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                <div>
                  <p className="font-medium text-[#111827]">
                    {selectedTab === 'sent' ? 'To: ' : 'From: '}
                    {tx.recipientIdentifier || tx.senderId?.substring(0, 8)}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#111827]">${tx.amount} SOL</p>
                  <p className="text-xs text-[#6B7280]">{tx.status}</p>
                </div>
              </div>
            ))}
            {((selectedTab === 'sent' ? sentTxs : receivedTxs).length === 0) && (
              <p className="text-center text-[#6B7280] py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function apiRequest(endpoint: string, options: any) {
  const res = await fetch(`http://localhost:3001${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed');
  return res.json();
}