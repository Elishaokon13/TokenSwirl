// utils/eip712Payload.ts
export function getEIP712Payload({
    tokens,
    amounts,
    deadline,
    chainId,
    verifyingContract,
  }: {
    tokens: string[];
    amounts: string[];
    deadline: number;
    chainId: number;
    verifyingContract: string;
  }) {
    return {
      domain: {
        name: 'BatchSwapToUSDC',
        version: '1',
        chainId,
        verifyingContract,
      },
      types: {
        BatchSwap: [
          { name: 'tokens', type: 'address[]' },
          { name: 'amounts', type: 'uint256[]' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'BatchSwap',
      message: {
        tokens,
        amounts,
        deadline,
      },
    };
  }
  