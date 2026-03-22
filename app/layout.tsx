import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZSAcoustics Admin - Product Management Portal',
  description: 'Professional product authoring and QR verification platform for ZSAcoustics sound engineering products',
  icons: {
    icon: [
      { url: 'https://zsindia.s3.us-east-1.amazonaws.com/SiteImages/zsindia-logo.png', type: 'image/png' },
    ],
    shortcut: 'https://zsindia.s3.us-east-1.amazonaws.com/SiteImages/zsindia-logo.png',
    apple: 'https://zsindia.s3.us-east-1.amazonaws.com/SiteImages/zsindia-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
