// components/BatchSwapForm.tsx

import React, { useState } from "react";
import { signAndSendBatchSwap } from "../hooks/useBatchSwap";
import { privateKeyToAccount } from "viem/accounts";

export default function BatchSwapForm() {
  const [tokens, setTokens] = useState(["0x..."]);
  const [amounts, setAmounts] = useState(["1000000"]);
  const [status, setStatus] = useState("");

  const signer = privateKeyToAccount("0xYOUR_PRIVATE_KEY"); // or use wagmi's connector

  const handleSubmit = async () => {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    // Prepare inputs array with correct structure and types
    const inputs = tokens.map((token, index) => ({
      tokenIn: token as `0x${string}`, // Assuming tokens are valid addresses
      amountIn: BigInt(amounts[index]), // Convert amounts to bigint
    }));

    try {
      setStatus("Signing and sending...");
      const tx = await signAndSendBatchSwap({
        inputs,
        deadline,
        signer,
      });
      setStatus(`Sent! Tx Hash: ${tx}`);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Execute Batch Swap
      </button>
      <p>{status}</p>
    </div>
  );
}
