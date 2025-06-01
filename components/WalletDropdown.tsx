'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Copy, LogOut, ExternalLink, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import Image from 'next/image';
import { Fragment } from 'react';

const BASE_EXPLORER = 'https://basescan.org'; // or Sepolia if testing

export default function WalletDropdown() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets.find((w) => w.connectedAt);
  const [copied, setCopied] = useState(false);
  const { isDark, toggle } = useThemeToggle();

  const handleCopy = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 1500);
  };

  if (!ready) return null;

  return authenticated && wallet ? (
    <div className="flex items-center space-x-4">
      {/* Network badge */}
      <div className="flex items-center space-x-2 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full font-medium">
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        <span className="text-gray-800 dark:text-white">Base Mainnet</span>
      </div>

      {/* Wallet Dropdown */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
          <span className="text-sm font-medium font-mono text-gray-900 dark:text-white">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Connected wallet</p>
              <div className="flex justify-between items-center mt-1">
                <p className="font-mono text-sm text-gray-800 dark:text-white">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
                <button onClick={handleCopy} className="text-gray-500 hover:text-black dark:hover:text-white">
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            <Menu.Item>
              {({ active }) => (
                <a
                  href={`${BASE_EXPLORER}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center px-4 py-2 text-sm ${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } text-gray-800 dark:text-gray-200`}
                >
                  <ExternalLink size={16} className="mr-2" /> View on explorer
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={toggle}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm ${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } text-gray-800 dark:text-gray-200`}
                >
                  {isDark ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              )}
            </Menu.Item>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm text-red-600 ${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <LogOut size={16} className="mr-2" /> Disconnect
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  ) : (
    <button
      onClick={login}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}
