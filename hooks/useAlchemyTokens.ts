import { alchemy } from '@/lib/alchemy';

export async function fetchAlchemyTokenBalances(address: string) {
  const balances = await alchemy.core.getTokenBalances(address);
  const nonZero = balances.tokenBalances.filter((t) => t.tokenBalance !== '0');

  const metadata = await Promise.all(
    nonZero.map((token) => alchemy.core.getTokenMetadata(token.contractAddress))
  );

  return nonZero.map((token, index) => {
    const meta = metadata[index];
    return {
      address: token.contractAddress,
      symbol: meta.symbol || '',
      logo: meta.logo || '',
      decimals: meta.decimals || 18,
      balance: Number(token.tokenBalance) / 10 ** (meta.decimals || 18),
    };
  });
}
