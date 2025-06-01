import { publicClient } from '@/lib/wagmi';
import { erc20Abi } from 'viem';

export type TokenMeta = {
  address: `0x${string}`;
  logo: string;
};

export type UserToken = {
  address: `0x${string}`;
  logo: string;
  symbol: string;
  balance: bigint;
  decimals: number;
};

export async function fetchTokenBalances(
  walletAddress: `0x${string}`,
  tokens: TokenMeta[]
): Promise<UserToken[]> {
  const calls = tokens.flatMap((token) => [
    {
      address: token.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress],
    },
    {
      address: token.address,
      abi: erc20Abi,
      functionName: 'decimals',
    },
    {
      address: token.address,
      abi: erc20Abi,
      functionName: 'symbol',
    },
  ]);

  const results = await publicClient.multicall({ contracts: calls });

  const balances: UserToken[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const balance = results[i * 3]?.result as bigint | undefined;
    const decimals = results[i * 3 + 1]?.result as number | undefined;
    const symbol = results[i * 3 + 2]?.result as string | undefined;

    if (balance !== undefined && decimals !== undefined && balance > BigInt(0)) {
      balances.push({
        address: tokens[i].address,
        logo: tokens[i].logo,
        symbol: symbol ?? '',
        balance,
        decimals,
      });
    }
  }

  return balances;
}
