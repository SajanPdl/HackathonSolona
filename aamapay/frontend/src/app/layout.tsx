import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { Metadata } from 'next';
import { WalletProvider } from '@/context/WalletContext';
import { QueryProvider } from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'AamaPay - On-Chain Remittance',
  description: 'Send USDC to Nepal, recipient gets cash instantly',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}