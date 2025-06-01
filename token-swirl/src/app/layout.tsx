"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            // Customize your preferred wallet connectors here
            supportedChains: [
              {
                id: 8453, // Base Mainnet
                name: 'Base Mainnet',
                nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
                rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
              },
            ],
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
