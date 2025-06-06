// lib/wagmi.ts
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { createPublicClient } from 'viem';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'), // Or Alchemy/Infura Base endpoint
  },
});

export const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'), // Or Alchemy/Infura Base endpoint
});
