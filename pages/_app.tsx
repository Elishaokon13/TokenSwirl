import '@/styles/globals.css'; // ✅ MUST be here
import { PrivyProvider } from '@privy-io/react-auth';
import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet'],
        appearance: { theme: 'light' },
      }}
    >
      <WagmiProvider config={config}>
        <Component {...pageProps} />
      </WagmiProvider>
    </PrivyProvider>
  );
}
