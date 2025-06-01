// hooks/useEIP7702Swap.ts
import { useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { getEIP712Payload } from '@/utils/eip712Payload';
import { abi as contractAbi } from '@/contracts/BatchSwapToUSDC.json';
import { base } from 'viem/chains';
import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
  decodeErrorResult,
  waitForTransactionReceipt,
  type WalletClient,
  type Account,
  type Hash,
} from 'viem';
import { toast } from 'sonner';

const CONTRACT_ADDRESS = '0x4A0d6ECA963Cc75c1318c79AE4830A33941C3Be5' as const;

interface SwapInput {
  tokenIn: `0x${string}`;
  amountIn: bigint;
}

interface ContractError extends Error {
  data?: string;
}

export function useEIP7702Swap() {
  const { wallets } = useWallets();
  const privyWallet = wallets[0];
  const address = privyWallet?.address;

  const swapToUSDC = useCallback(
    async (inputs: SwapInput[]): Promise<Hash> => {
      if (!privyWallet) {
        throw new Error('Wallet not connected');
      }

      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const tokens = inputs.map((input) => input.tokenIn);
      const amounts = inputs.map((input) => input.amountIn.toString());
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      try {
        const walletClient: WalletClient = await privyWallet.getWalletClient();
        
        // Extract account directly from wallet client
        const account: Account = walletClient.account!;

        const payload = getEIP712Payload({
          tokens,
          amounts,
          deadline,
          chainId: base.id,
          verifyingContract: CONTRACT_ADDRESS,
        });

        // Use the wallet client directly for signing and transactions
        const signature = await walletClient.signTypedData({
          domain: payload.domain,
          types: payload.types,
          primaryType: payload.primaryType,
          message: payload.message,
        });

        const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        });

        // Use wallet client for transaction
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'batchSwapToUSDC',
          args: [tokens, amounts, deadline, signature],
        });

        toast.loading('Transaction pending...', { id: 'tx' });

        await waitForTransactionReceipt(publicClient, { hash });

        toast.success('Swap confirmed!', { id: 'tx' });
        return hash;
      } catch (error) {
        const contractError = error as ContractError;
        
        if (contractError?.data) {
          try {
            const decoded = decodeErrorResult({
              abi: contractAbi,
              data: contractError.data,
            });
            const errorMessage = `Swap failed: ${decoded.errorName}`;
            toast.error(errorMessage);
            throw new Error(decoded.errorName);
          } catch (decodeError) {
            const fallbackMessage = 'Swap failed: could not decode error';
            toast.error(fallbackMessage);
            throw new Error(fallbackMessage);
          }
        } else {
          const errorMessage = contractError.message || 'Unknown error occurred';
          toast.error(`Swap failed: ${errorMessage}`);
          throw contractError;
        }
      }
    },
    [privyWallet]
  );

  return { 
    swapToUSDC, 
    walletAddress: address,
    isConnected: Boolean(privyWallet && address)
  };
}