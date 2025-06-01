// components/TokenList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { fetchAlchemyTokenBalances } from '@/hooks/useAlchemyTokens';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TokenList() {
  const { wallets } = useWallets();
  const address = wallets.find((w) => w.connectedAt)?.address;
  const [tokens, setTokens] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetchAlchemyTokenBalances(address)
        .then((data) => {
          setTokens(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, [address]);

  const toggle = (tokenAddress: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(tokenAddress) ? next.delete(tokenAddress) : next.add(tokenAddress);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const currentPageTokens = paginatedTokens.map((token) => token.address);
      const allSelected = currentPageTokens.every((addr) => prev.has(addr));
      if (allSelected) {
        currentPageTokens.forEach((addr) => next.delete(addr));
      } else {
        currentPageTokens.forEach((addr) => next.add(addr));
      }
      return next;
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const paginatedTokens = tokens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tokens</h2>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-6">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded" />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                    Token
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                    Symbol
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(itemsPerPage)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded" />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-4 text-center sm:p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tokens found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                      <button
                        onClick={toggleAll}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {paginatedTokens.every((token) => selected.has(token.address))
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                      Token
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                      Symbol
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedTokens.map((token) => (
                    <tr
                      key={token.address}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                        <input
                          type="checkbox"
                          checked={selected.has(token.address)}
                          onChange={() => toggle(token.address)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                        {token.logo ? (
                          <Image
                            src={token.logo}
                            alt={token.symbol}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {token.symbol}
                        </p>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {token.balance.toFixed(4)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center justify-between gap-4 sm:flex-row sm:px-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, tokens.length)} of {tokens.length} tokens
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}