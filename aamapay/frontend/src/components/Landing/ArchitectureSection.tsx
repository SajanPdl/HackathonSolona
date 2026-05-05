export function ArchitectureSection() {
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6">
              Built on Decentralized Infrastructure
            </h2>
            <p className="text-[#6B7280] mb-8">
              AamaPay leverages Solana's high-performance blockchain for secure, instant settlements. Our smart contract escrow ensures funds are protected throughout the transfer process.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#B91C1C] font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827]">Sender initiates transfer</h4>
                  <p className="text-sm text-[#6B7280]">USDC deposited into smart contract escrow</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#B91C1C] font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827]">Claim code generated</h4>
                  <p className="text-sm text-[#6B7280]">One-time code sent to recipient via any channel</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#B91C1C] font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827]">Agent verifies & pays cash</h4>
                  <p className="text-sm text-[#6B7280]">Local agent confirms identity and releases funds</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#16A34A]/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#16A34A] font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#111827]">Smart contract releases</h4>
                  <p className="text-sm text-[#6B7280]">Funds transferred to agent wallet automatically</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#B91C1C]" />
                  <span className="font-medium text-[#111827]">Sender</span>
                </div>
                <p className="text-sm text-[#6B7280] font-mono">7x8Km...3f2A</p>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[#B91C1C]/30" />
              </div>

              <div className="p-4 bg-[#B91C1C]/5 rounded-xl border-2 border-[#B91C1C]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#B91C1C]" />
                  <span className="font-medium text-[#111827]">Smart Contract</span>
                </div>
                <p className="text-sm text-[#6B7280]">Escrow: 100 USDC</p>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[#B91C1C]/30" />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                  <span className="font-medium text-[#111827]">Agent → Recipient</span>
                </div>
                <p className="text-sm text-[#6B7280]">Cash: NPR 13,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}