import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { Metadata } from 'next';
import { WalletProvider } from '@/context/WalletContext';
import { QueryProvider } from '@/components/QueryProvider';
import { Navbar } from '@/components/Landing/Navbar';

export const metadata: Metadata = {
  title: 'AamaPay - On-Chain Remittance',
  description: 'Send SOL to Nepal, recipient gets cash instantly',
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
            <Navbar />
            {children}
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}