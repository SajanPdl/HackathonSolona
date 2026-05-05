import { Wallet, Send, Key, Banknote } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    number: '01',
    title: 'Connect Wallet',
    description: 'Link your Phantom wallet to get started',
  },
  {
    icon: Send,
    number: '02',
    title: 'Send USDC',
    description: 'Enter amount and recipient details',
  },
  {
    icon: Key,
    number: '03',
    title: 'Share Code',
    description: 'Give claim code to recipient',
  },
  {
    icon: Banknote,
    number: '04',
    title: 'Get Cash',
    description: 'Family receives cash from agent',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            How It Works
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            Simple four-step process to send money to Nepal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#B91C1C]/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[#B91C1C]" />
                  </div>
                  <span className="text-4xl font-bold text-gray-100">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280]">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#B91C1C]/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}