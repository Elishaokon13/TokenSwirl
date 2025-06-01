// pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { base } from 'viem/chains';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet'],
        appearance: { theme: 'light' },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      <WagmiProvider config={config}>
        <Component {...pageProps} />
      </WagmiProvider>
    </PrivyProvider>
  );
}
