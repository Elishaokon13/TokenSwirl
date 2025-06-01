export const batchSwapAbi = [
    {
      "inputs": [
        {
          "components": [
            { "internalType": "address", "name": "tokenIn", "type": "address" },
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
          ],
          "internalType": "struct BatchSwapToUSDC.SwapInput[]",
          "name": "inputs",
          "type": "tuple[]"
        }
      ],
      "name": "batchSwapToUSDC",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  