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
  console.log('wallets', wallets);
  const connectedWallet = wallets.find(wallet => 
    wallet.connectedAt && 
    wallet.chainId === 'eip155:8453' // Base network
  );
  const address = connectedWallet?.address;
  console.log('connectedWallet', address);

  const swapToUSDC = useCallback(
    async (inputs: SwapInput[]): Promise<Hash> => {
      console.log('Starting swap with inputs:', inputs);
      
      if (!connectedWallet || !address) {
        throw new Error('Please connect your wallet to Base network');
      }

      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const swaps = inputs.map((input) => ({
        tokenIn: input.tokenIn,
        amountIn: input.amountIn,
        minAmountOut: BigInt(0) // You might want to calculate this based on slippage
      }));
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const chainId = BigInt(base.id);

      try {
        console.log('Getting Ethereum provider...');
        const provider = await connectedWallet.getEthereumProvider();
        console.log('Provider obtained:', provider);

        // Create wallet client with explicit account
        const walletClient: WalletClient = createWalletClient({
          chain: base,
          transport: custom(provider),
          account: address as `0x${string}`,
        });

        console.log('Wallet client created with account:', walletClient.account);

        const payload = getEIP712Payload({
          tokens: swaps.map(s => s.tokenIn),
          amounts: swaps.map(s => s.amountIn),
          deadline,
          chainId: base.id,
          verifyingContract: CONTRACT_ADDRESS,
        });
        console.log('EIP712 payload created:', payload);

        console.log('Signing typed data...');
        const signature = await walletClient.signTypedData({
          account: address as `0x${string}`,
          domain: payload.domain as any,
          types: payload.types as any,
          primaryType: payload.primaryType as "BatchSwap",
          message: payload.message as any,
        });
        console.log('Signature obtained:', signature);

        const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        });

        // Get the current nonce for the user
        const nonce = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: contractAbi as Abi,
          functionName: 'nonces',
          args: [address],
        });

        console.log('Sending transaction...');
        const txHash = await walletClient.writeContract({
          chain: base,
          account: address as `0x${string}`,
          address: CONTRACT_ADDRESS,
          abi: contractAbi as Abi,
          functionName: 'batchSwapToUSDC',
          args: [swaps, address, nonce, signature],
        });
        console.log('Transaction sent:', txHash);

        toast.loading('Transaction pending...', { id: 'tx' });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        toast.success('Swap confirmed!', { id: 'tx' });
        return txHash;
      } catch (error) {
        console.error('Swap error:', error);
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
    [connectedWallet, address]
  );

  return { 
    swapToUSDC, 
    walletAddress: address,
    isConnected: Boolean(connectedWallet && address)
  };
}