'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Wallet, Activity } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B91C1C] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="font-bold text-xl text-[#111827]">AamaPay</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              How It Works
            </Link>
            <Link href="#features" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              Features
            </Link>
            <Link href="/dashboard" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              Profile
            </Link>
            <Link href="#agents" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              For Agents
            </Link>
            <Link href="/simulation" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Demo
            </Link>
            <Link href="/admin" className="text-[#6B7280] hover:text-[#B91C1C] text-sm font-medium">
              Admin
            </Link>
            <Link href="/send" className="bg-[#B91C1C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#991B1B] flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link href="#how-it-works" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <Link href="#features" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="/dashboard" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href="/profile" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              Profile
            </Link>
            <Link href="#agents" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              For Agents
            </Link>
            <Link href="/simulation" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              Demo
            </Link>
            <Link href="/admin" className="block text-[#6B7280] hover:text-[#B91C1C] py-2" onClick={() => setMobileOpen(false)}>
              Admin
            </Link>
            <Link href="/send" className="block bg-[#B91C1C] text-white px-4 py-2 rounded-xl text-center" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}