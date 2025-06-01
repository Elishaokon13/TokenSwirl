// hooks/useBatchSwap.ts

import { getEIP712Payload } from "../utils/eip712Payload";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../contracts/BatchSwapToUSDC.json";

const CONTRACT_ADDRESS = "0x4A0d6ECA963Cc75c1318c79AE4830A33941C3Be5";

export async function signAndSendBatchSwap({
  tokens,
  amounts,
  deadline,
  signer,
}) {
  const client = createWalletClient({
    account: signer,
    chain: base,
    transport: custom(window.ethereum),
  });

  const chainId = base.id;

  const payload = getEIP712Payload({
    tokens,
    amounts,
    deadline,
    chainId,
    verifyingContract: CONTRACT_ADDRESS,
  });

  const signature = await client.signTypedData({
    domain: payload.domain,
    types: payload.types,
    primaryType: payload.primaryType,
    message: payload.message,
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const hash = await publicClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "batchSwapToUSDC",
    args: [tokens, amounts, deadline, signature],
  });

  return hash;
}
