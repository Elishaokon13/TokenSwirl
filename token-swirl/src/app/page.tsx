'use client';

import Image from "next/image";
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatUnits } from 'viem';

interface TokenData {
  contractAddress: string;
  tokenBalance: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdcValue: string;
}

interface TokenBalanceData {
  contractAddress: string;
  tokenBalance: string;
}

interface AlchemyTokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

const USDC_CONTRACT_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdcd5cb5'; // USDC on Base Mainnet

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
        <WalletConnect />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

function WalletConnect() {
  const { login, authenticated, user } = usePrivy();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/alchemy', {
          method: 'alchemy_getTokenBalances',
          params: [user.wallet.address, 'erc20'],
        });

        const tokenBalances = response.data.result.tokenBalances;
        
        // Filter out zero balances and fetch metadata
        const nonZeroTokenBalances: TokenBalanceData[] = (tokenBalances as TokenBalanceData[]).filter(token => token.tokenBalance !== '0');

        const tokensWithMetadata = await Promise.all(nonZeroTokenBalances.map(async (token: TokenBalanceData) => {
          const metadataResponse = await axios.post('/api/alchemy', {
            method: 'alchemy_getTokenMetadata',
            params: [token.contractAddress],
          });
          // Explicitly cast to match TokenData structure
          const metadata = metadataResponse.data.result as AlchemyTokenMetadata;

          // Fetch 0x quote for USDC value
          let usdcValue = 'N/A';
          try {
            const quoteResponse = await axios.get('/api/0x', {
              params: {
                sellToken: token.contractAddress,
                buyToken: USDC_CONTRACT_ADDRESS_BASE,
                sellAmount: token.tokenBalance, // Token balance in wei
              },
            });
            // The buyAmount in the 0x quote is the amount of buyToken (USDC) in its smallest unit (wei for USDC)
            // We need to format this based on USDC decimals (usually 6)
            // For simplicity here, we'll just display the raw buyAmount for now and format later in display
            usdcValue = quoteResponse.data.buyAmount;
          } catch (quoteError: unknown) {
            if (quoteError instanceof Error) {
              console.error(`Error fetching 0x quote for ${metadata.symbol}:`, quoteError.message);
            } else {
              console.error(`Unknown error fetching 0x quote for ${metadata.symbol}:`, quoteError);
            }
            // If quote fails, assume no liquidity or other issue and mark as N/A
          }

          return { 
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            metadata: metadata,
            usdcValue: usdcValue,
          };
        }));

        console.log('Fetched Tokens:', tokensWithMetadata);
        setTokens(tokensWithMetadata as TokenData[]);
      } catch (err: unknown) {
        console.error('Error fetching tokens:', err);
        setError('Failed to fetch tokens.');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [authenticated, user]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!authenticated ? (
        <button
          onClick={login}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-center">
          <p className="text-lg">Connected Address:</p>
          <p className="text-md font-mono">{user?.wallet?.address}</p>
          {loading && <p>Loading tokens...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {tokens.length > 0 && (
            <div>
              <h3 className="text-xl mt-4">Detected Tokens:</h3>
              <div className="mt-4 w-full overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">USDC Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <tr key={token.contractAddress} className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{token.metadata.symbol}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatUnits(BigInt(token.tokenBalance), token.metadata.decimals)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{token.usdcValue !== 'N/A' ? formatUnits(BigInt(token.usdcValue), 6) : 'N/A'}</td>{/* Assuming USDC has 6 decimals */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
