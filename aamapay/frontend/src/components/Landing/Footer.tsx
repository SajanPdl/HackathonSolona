import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 bg-[#111827] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#B91C1C] flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="font-bold text-xl text-white">AamaPay</span>
            </div>
            <p className="text-gray-400 text-sm">
              On-chain remittance for financial inclusion. Send money to Nepal
              instantly.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/send"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Send Money
                </Link>
              </li>
              <li>
                <Link
                  href="/claim"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Claim Money
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Agents</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/agent/register"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Become an Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/agent"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Agent Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Technology</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Solana Blockchain
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Smart Contracts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  SOLONA Stablecoin
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 AamaPay. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
