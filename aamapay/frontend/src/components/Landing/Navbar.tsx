import Link from 'next/link';
import { Menu, X, Wallet, Activity } from 'lucide-react';

export function Navbar() {
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

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-[#6B7280] hover:text-[#B91C1C] transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href="#features" className="text-[#6B7280] hover:text-[#B91C1C] transition-colors text-sm font-medium">
              Features
            </Link>
            <Link href="/dashboard" className="text-[#6B7280] hover:text-[#B91C1C] transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link href="#agents" className="text-[#6B7280] hover:text-[#B91C1C] transition-colors text-sm font-medium">
              For Agents
            </Link>
            <Link href="/simulation" className="text-[#6B7280] hover:text-[#B91C1C] transition-colors text-sm font-medium flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Demo
            </Link>
            <Link href="/send" className="bg-[#B91C1C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#991B1B] transition-colors flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}