import { Shield, Clock, Percent, Globe } from 'lucide-react';

const trustItems = [
  {
    icon: Shield,
    title: 'Secure Escrow',
    description: 'Funds locked in smart contract until verified delivery',
  },
  {
    icon: Clock,
    title: 'Instant Settlement',
    description: 'Solana blockchain processes in under 1 second',
  },
  {
    icon: Percent,
    title: 'Low Fees',
    description: 'Only 0.5% platform fee, no hidden charges',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Send from anywhere, recipient cashes out locally',
  },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose AamaPay?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built on Solana for speed and security. Designed for the Nepal remittance corridor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/20 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[#B91C1C]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}