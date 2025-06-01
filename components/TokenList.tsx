'use client';

import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { fetchTokenBalances, UserToken, TokenMeta } from '@/hooks/useTokenBalances';
import Image from 'next/image';

const TOKENS: TokenMeta[] = [
  {
    address: '0x4200000000000000000000000000000000000006', // WETH
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    address: '0xd9fcd98c322942075a5c3860693e9f4f03aae07b', // USDC (example)
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png',
  },
  // Add more token metadata here
];

export default function TokenList() {
  const { wallets } = useWallets();
  const address = wallets.find((w) => w.connectedAt)?.address as `0x${string}` | undefined;

  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (address) {
      fetchTokenBalances(address, TOKENS).then(setTokens);
    }
  }, [address]);

  const toggleToken = (tokenAddress: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(tokenAddress)) copy.delete(tokenAddress);
      else copy.add(tokenAddress);
      return copy;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-4">
      <h3 className="text-xl font-semibold">Select Tokens to Swap</h3>
      {tokens.map((token) => (
        <label
          key={token.address}
          className="flex items-center space-x-3 bg-muted px-4 py-3 rounded-lg border cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.has(token.address)}
            onChange={() => toggleToken(token.address)}
            className="form-checkbox w-5 h-5 accent-blue-600"
          />
          <Image src={token.logo} alt={token.symbol} width={24} height={24} className="rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-medium">{token.symbol}</p>
            <p className="text-xs text-muted-foreground">
              {(Number(token.balance) / 10 ** token.decimals).toFixed(4)}
            </p>
          </div>
        </label>
      ))}

      {selected.size > 0 && (
        <p className="text-sm text-green-600 mt-4">{selected.size} token(s) selected</p>
      )}
    </div>
  );
}
