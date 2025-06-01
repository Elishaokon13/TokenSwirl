import { useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { getEIP712Payload } from '@/utils/eip712Payload';
import contractAbi from '@/contracts/BatchSwapToUSDC.json';
import { base } from 'viem/chains';
import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
  decodeErrorResult,
  type WalletClient,
  type Hash,
  type Abi,
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
  const privyWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
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
      const amounts = inputs.map((input) => input.amountIn);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const chainId = BigInt(base.id);

      try {
        const provider = await privyWallet.getEthereumProvider();

        const walletClient: WalletClient = createWalletClient({
          chain: base,
          transport: custom(provider),
        });

        if (!walletClient.account) {
          throw new Error('No account found in wallet client');
        }

        const payload = getEIP712Payload({
          tokens,
          amounts,
          deadline,
          chainId: base.id,
          verifyingContract: CONTRACT_ADDRESS,
        });

        const signature = await walletClient.signTypedData({
          account: walletClient.account,
          domain: payload.domain as any,
          types: payload.types as any,
          primaryType: payload.primaryType as "BatchSwap",
          message: payload.message as any,
        });

        const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        });

        const txHash = await walletClient.writeContract({
          chain: base,
          account: walletClient.account,
          address: CONTRACT_ADDRESS,
          abi: contractAbi as Abi,
          functionName: 'batchSwapToUSDC',
          args: [tokens, amounts, deadline, signature],
        });

        toast.loading('Transaction pending...', { id: 'tx' });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        toast.success('Swap confirmed!', { id: 'tx' });
        return txHash;
      } catch (error) {
        const contractError = error as ContractError;
        
        if (contractError?.data) {
          try {
            const decoded = decodeErrorResult({
              abi: contractAbi as Abi,
              data: contractError.data as `0x${string}`,
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