'use client';

import { useEffect, useRef } from 'react';
import { useSimulation } from './SimulationProvider';
import gsap from 'gsap';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  QrCode,
  ArrowRight,
  DollarSign
} from 'lucide-react';

export function FlowVisualization() {
  const { transactions, selectedId } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeTx = transactions.find(tx => tx.id === selectedId);
  const latestTx = transactions[0];

  useEffect(() => {
    if (!containerRef.current) return;
    
    const nodes = containerRef.current.querySelectorAll('.flow-node');
    nodes.forEach((node, i) => {
      gsap.fromTo(node, 
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.2, ease: 'back.out(1.7)' }
      );
    });
  }, [latestTx?.id]);

  const getActiveStep = () => {
    if (!latestTx) return 0;
    const statusOrder = ['CREATED', 'PENDING', 'CONFIRMING', 'CONFIRMED', 'CLAIM_CODE_GENERATED', 'REDEEMED', 'COMPLETED'];
    return statusOrder.indexOf(latestTx.status);
  };

  const activeStep = getActiveStep();

  const steps = [
    { icon: Wallet, label: 'Sender', status: 'initiated' },
    { icon: Loader2, label: 'Blockchain', status: 'confirming' },
    { icon: QrCode, label: 'Claim Code', status: 'generated' },
    { icon: CheckCircle, label: 'Redeemed', status: 'completed' },
  ];

  return (
    <div ref={containerRef} className="bg-white rounded-3xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-[#111827] mb-6">Transaction Flow</h3>

      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep >= index;
            const isCurrent = activeStep === index;

            return (
              <div key={index} className="flow-node relative flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? isCurrent 
                      ? 'bg-[#B91C1C] text-white shadow-lg shadow-[#B91C1C]/30' 
                      : 'bg-[#16A34A] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className={`w-6 h-6 ${isCurrent && activeStep === 1 ? 'animate-spin' : ''}`} />
                </div>
                <p className={`mt-2 text-xs font-medium ${isActive ? 'text-[#111827]' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="absolute top-7 left-14 right-14 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-[#16A34A] to-[#B91C1C] transition-all duration-500"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {activeTx && (
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Current Transaction</span>
            <span className="font-mono text-xs text-[#111827]">{activeTx.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl text-[#111827]">${activeTx.amount}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              activeTx.status === 'REDEEMED' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {activeTx.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="text-lg font-bold text-[#111827]">{transactions.length}</p>
          <p className="text-xs text-[#6B7280]">Total</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="text-lg font-bold text-yellow-600">{transactions.filter(t => t.status === 'PENDING' || t.status === 'CONFIRMING').length}</p>
          <p className="text-xs text-[#6B7280]">Pending</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="text-lg font-bold text-green-600">{transactions.filter(t => t.status === 'COMPLETED').length}</p>
          <p className="text-xs text-[#6B7280]">Done</p>
        </div>
      </div>
    </div>
  );
}