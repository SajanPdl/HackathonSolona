import { Zap, Shield, Smartphone, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Transfers complete in under 1 second on Solana blockchain",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Smart contract escrow protects your funds until delivery",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Optimized for mobile wallets used in Nepal and abroad",
  },
  {
    icon: TrendingUp,
    title: "Zero Volatility",
    description: "SOLONA stablecoin keeps value consistent during transfer",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Powerful Features
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            Everything you need for seamless international transfers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5] rounded-2xl p-6 hover:bg-[#B91C1C] group transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 group-hover:bg-[#B91C1C]/10 transition-colors">
                <feature.icon className="w-6 h-6 text-[#B91C1C] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827] group-hover:text-white mb-2 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B7280] group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
