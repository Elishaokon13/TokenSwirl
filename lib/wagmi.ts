import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { createPublicClient } from 'viem';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(), // optionally set a custom RPC
  },
});

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});
