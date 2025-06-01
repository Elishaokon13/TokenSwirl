// lib/alchemy.ts
import { Alchemy, Network } from 'alchemy-sdk';

// Configure Alchemy SDK for Base Network
export const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, // Ensure this is set in your environment
  network: Network.BASE_MAINNET, // Explicitly set to Base Mainnet (chain ID: 8453)
});

export async function fetchAlchemyTokenBalances(address: string) {
  try {
    // Fetch token balances on Base Network
    const balances = await alchemy.core.getTokenBalances(address);

    // Filter out tokens with zero balance
    const nonZero = balances.tokenBalances.filter((t) => t.tokenBalance !== '0');

    // Fetch metadata for non-zero balance tokens
    const metadata = await Promise.all(
      nonZero.map((token) =>
        alchemy.core.getTokenMetadata(token.contractAddress).catch((error) => {
          console.error(`Error fetching metadata for ${token.contractAddress}:`, error);
          return null; // Handle invalid tokens gracefully
        })
      )
    );

    // Combine token balances with metadata, filter for valid ERC20 tokens
    return nonZero
      .map((token, index) => {
        const meta = metadata[index];
        // Ensure token is ERC20 (has symbol and decimals) and metadata is valid
        if (!meta || !meta.symbol || meta.decimals === null || meta.decimals === undefined) {
          return null;
        }
        return {
          address: token.contractAddress,
          symbol: meta.symbol,
          logo: meta.logo || '',
          decimals: meta.decimals,
          balance: Number(token.tokenBalance) / 10 ** meta.decimals,
        };
      })
      .filter((token): token is NonNullable<typeof token> => token !== null);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}