'use client';

import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export function Scene1({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center max-w-4xl px-8">
        <h1 className="text-6xl md:text-8xl font-bold text-[#111827] leading-tight tracking-tight">
          Send Money
          <br />
          <span className="text-[#B91C1C]">Home Instantly</span>
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-[#6B7280] max-w-2xl mx-auto">
          Fast, secure, and affordable remittance powered by blockchain technology
        </p>
      </div>
    </div>
  );
}

export function Scene2({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
      <div className="flex items-center gap-16 max-w-6xl px-8">
        <div className="flex-1">
          <div className="w-64 h-80 rounded-3xl bg-gradient-to-br from-[#B91C1C] to-[#991B1B] flex items-center justify-center shadow-2xl">
            <div className="w-32 h-48 bg-white/20 rounded-2xl backdrop-blur flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-full h-8 bg-white/30 rounded-xl" />
              <div className="w-3/4 h-4 bg-white/20 rounded" />
              <div className="w-full h-12 bg-white rounded-xl mt-4" />
              <p className="text-white text-sm font-medium">$100 USDC</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">
            Start from anywhere
            <br />
            <span className="text-[#B91C1C]">in the world</span>
          </h2>
          <p className="text-lg text-[#6B7280] max-w-md">
            Connect your wallet and send USDC to your family in Nepal. 
            No bank account needed for them to receive.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Scene3({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="text-center max-w-4xl px-8">
        <div className="relative mb-12">
          <div className="flex items-center justify-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center">
              <span className="text-3xl">💳</span>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-[#B91C1C] via-[#6366F1] to-[#16A34A] rounded-full" />
            <div className="w-20 h-20 rounded-2xl bg-[#16A34A]/10 flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center">
              <span className="text-2xl">⛓️</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6">
          Secured by
          <br />
          <span className="bg-gradient-to-r from-[#B91C1C] to-[#6366F1] bg-clip-text text-transparent">
            On-Chain Escrow
          </span>
        </h2>
        <p className="text-xl text-[#6B7280]">
          Your funds are locked in a smart contract until the recipient confirms receipt
        </p>
      </div>
    </div>
  );
}

export function Scene4({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-16 max-w-6xl px-8">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">
            Simple claim code,
            <br />
            <span className="text-[#B91C1C]">no bank required</span>
          </h2>
          <p className="text-lg text-[#6B7280] max-w-md">
            Share a secure claim code with your recipient. They can withdraw from any agent nearby.
          </p>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-64 h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-8 border-gray-100">
              <div className="grid grid-cols-8 gap-1 p-8">
                {[...Array(64)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-[#111827]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#B91C1C] text-white px-6 py-2 rounded-full font-mono font-bold text-lg">
              AAP7XK2M9QL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Scene5({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-16 max-w-6xl px-8">
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-72 h-96 bg-gradient-to-br from-[#16A34A]/20 to-[#16A34A]/5 rounded-3xl p-6 flex flex-col items-center">
              <div className="w-full h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <span className="text-6xl">🤝</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#111827]">Agent Location</p>
                <p className="text-sm text-[#6B7280]">Kathmandu, Nepal</p>
              </div>
              <div className="mt-4 px-6 py-2 bg-[#16A34A] text-white rounded-full font-medium">
                Cash Ready
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-6">
            Withdraw instantly
            <br />
            <span className="text-[#16A34A]">through local agents</span>
          </h2>
          <p className="text-lg text-[#6B7280] max-w-md">
            Your family visits any verified AamaPay agent, shows the claim code, and receives cash instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Scene6({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="text-center max-w-4xl px-8">
        <h2 className="text-6xl md:text-8xl font-bold text-[#111827] mb-8">
          Remittance,
          <br />
          <span className="text-[#B91C1C]">reimagined.</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/send"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#B91C1C] text-white rounded-xl font-medium text-lg hover:bg-[#991B1B] transition-colors shadow-lg"
          >
            Send Money
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="/receive"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#111827] rounded-xl font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            Receive Money
          </a>
        </div>
      </div>
    </div>
  );
}