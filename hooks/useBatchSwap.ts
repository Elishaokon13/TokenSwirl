// hooks/useBatchSwap.ts

import { getEIP712Payload } from "../utils/eip712Payload";
import { createWalletClient, custom, createPublicClient, http, type Abi } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import contractAbi from "../contracts/BatchSwapToUSDC.json";

const CONTRACT_ADDRESS = "0x4A0d6ECA963Cc75c1318c79AE4830A33941C3Be5" as `0x${string}`;

interface SwapInput {
  tokenIn: `0x${string}`;
  amountIn: bigint;
}

interface SignAndSendBatchSwapParams {
  inputs: SwapInput[];
  deadline: bigint;
  signer: PrivateKeyAccount;
}

const getNonce = async (userAddress: `0x${string}`): Promise<bigint> => {
    console.log(`Mock fetching nonce for ${userAddress}...`);
    return BigInt(1); // Mock nonce as bigint
};

export async function signAndSendBatchSwap({ inputs, deadline, signer }: SignAndSendBatchSwapParams) {
  const client = createWalletClient({
    account: signer,
    chain: base,
    transport: custom(window.ethereum as any),
  });

  const chainId = base.id;

  const tokens = inputs.map(input => input.tokenIn);
  const amounts = inputs.map(input => input.amountIn);

  const payload = getEIP712Payload({
    tokens,
    amounts,
    deadline,
    chainId,
    verifyingContract: CONTRACT_ADDRESS,
  });

  const signature = await client.signTypedData({
    account: signer,
    domain: payload.domain as { chainId: number | bigint | undefined; name?: string | undefined; salt?: `0x${string}` | undefined; verifyingContract?: `0x${string}` | undefined; version?: string | undefined; },
    types: payload.types as any,
    primaryType: payload.primaryType as "BatchSwap",
    message: payload.message as any,
  });

  const swaps = inputs.map(input => ({ tokenIn: input.tokenIn, amountIn: input.amountIn, minAmountOut: BigInt(0) }));
  const user = signer.address;
  const nonce = await getNonce(user);

  const hash = await client.writeContract({
    chain: base,
    account: signer,
    address: CONTRACT_ADDRESS,
    abi: contractAbi as Abi,
    functionName: "batchSwapToUSDC",
    args: [swaps, user, nonce, signature],
  });

  return hash;
}
