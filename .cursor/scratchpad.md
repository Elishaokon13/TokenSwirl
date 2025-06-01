# Project Plan: Batch Token Swapper dApp

## Background and Motivation
The goal is to develop a decentralized application (dApp) using Next.js 14 (App Router), TypeScript, and TailwindCSS, integrated with Aceternity UI components. This dApp will allow users to connect their Ethereum wallet via Privy, fetch all their ERC-20 token balances using Alchemy, get swap quotes to USDC via 0x API, and execute batch swaps of these tokens to USDC in a single transaction using a custom Uniswap V4 hook contract compatible with EIP-7702.

## Key Challenges and Analysis
1.  **EIP-7702 Integration**: This is a relatively new standard. Implementing the signing and transaction construction using viem and Privy's `useSignAuthorization` will require careful attention to detail and potentially referencing external documentation/examples.
2.  **Uniswap V4 Hook Development**: Designing and implementing a Solidity contract that can handle batch approvals and swaps within the Uniswap V4 hook architecture requires a deep understanding of Uniswap V4's `PoolManager` and hook lifecycle.
3.  **Integrating Multiple APIs/Libraries**: Seamlessly connecting the frontend (Next.js, Privy, Aceternity UI), backend API routes (Alchemy, 0x), and blockchain interactions (viem, Uniswap V4 SDK, custom contract) is complex.
4.  **Batching Logic**: The logic for identifying tokens, fetching quotes, calculating USDC values, and then structuring the batch swap calls within the hook contract needs to be robust and handle various token types and potential errors (e.g., lack of liquidity).
5.  **Time Constraint**: Completing all features, including smart contract development, EIP-7702 implementation, and a polished UI with error handling and loading states, within 3 hours is highly ambitious. Prioritization will be key.
6.  **Testing**: Setting up a local development environment for Uniswap V4 hooks and EIP-7702 transactions will be necessary for effective testing before deploying to Sepolia.

## High-level Task Breakdown
Each task should be small and verifiable. Success criteria are defined for each.

1.  **Project Setup**: Initialize a Next.js 14 project with TypeScript, TailwindCSS, and install core dependencies (Privy, viem, axios, aceternity-ui).
    *   *Success Criteria*: Project is created, dependencies are installed, and basic TailwindCSS styling is functional.
2.  **Privy Wallet Connection**: Implement the "Connect Wallet" functionality using Privy.
    *   *Success Criteria*: User can click a button, connect their MetaMask wallet, and the connected wallet address is displayed on the page.
3.  **Backend API Routes**: Create Next.js API routes for secure calls to Alchemy and 0x APIs.
    *   *Success Criteria*: `/api/alchemy` and `/api/0x` routes exist and can securely make external API calls using environment variables.
4.  **Alchemy Token Fetching**: Implement logic to call the Alchemy API route (`alchemy_getTokenBalances` and `alchemy_getTokenMetadata`) to get ERC-20 token balances for the connected wallet.
    *   *Success Criteria*: After wallet connection, the application fetches and logs the user's token balances and metadata (symbol, decimals).
5.  **Filter Tokens and Get 0x Quotes**: Filter out zero-balance tokens and tokens without USDC liquidity. Call the 0x API route to get USDC swap quotes for the remaining tokens.
    *   *Success Criteria*: The application filters tokens and fetches 0x quotes, calculating the approximate USDC value for each token balance.
6.  **Display Token Table**: Use Aceternity UI components (e.g., Table, Card) to display the detected tokens, their balances, and estimated USDC values.
    *   *Success Criteria*: A responsive table shows token symbol, balance, and USDC value for detected tokens.
7.  **Hardhat/Foundry Setup**: Set up a Hardhat or Foundry project for the Solidity contract.
    *   *Success Criteria*: Contract development environment is configured.
8.  **Uniswap V4 Hook Contract**: Write the Solidity smart contract for the Uniswap V4 hook that handles batch ERC-20 approvals and swaps to USDC.
    *   *Success Criteria*: A Solidity contract is written that includes functions for batch approvals and swaps, designed to be used as a Uniswap V4 hook and compatible with EIP-7702 delegation.
9.  **Deploy Hook Contract**: Deploy the hook contract to the Sepolia testnet.
    *   *Success Criteria*: The contract is successfully deployed, and its address is available.
10. **Uniswap V4 SDK Integration**: Use `@uniswap/v4-sdk` and viem to construct the swap data required to interact with the hook contract via the Uniswap V4 `PoolManager` for batch swaps.
    *   *Success Criteria*: The application can generate the necessary call data for executing batch swaps through the deployed hook contract.
11. **Construct EIP-7702 Transaction**: Use viem to construct a Type 0x04 EIP-7702 transaction that delegates execution to the deployed hook contract.
    *   *Success Criteria*: The application can build the EIP-7702 transaction structure.
12. **Sign and Send Transaction**: Use Privy's `useSignAuthorization` hook to sign the EIP-7702 transaction and send it.
    *   *Success Criteria*: The "Swap All to USDC" button triggers the transaction signing and sending process.
13. **Transaction Status and Notifications**: Display transaction status (pending, success, error) using toast notifications (e.g., using a library like `react-hot-toast`).
    *   *Success Criteria*: User is notified about the transaction progress and outcome.
14. **Error Handling and Loading States**: Implement comprehensive error handling for API calls, blockchain interactions, and UI states (loading, empty state).
    *   *Success Criteria*: The application gracefully handles errors and shows appropriate loading indicators.
15. **README and Environment File**: Create a README with setup and deployment instructions and an example `.env` file.
    *   *Success Criteria*: Documentation is provided for setting up and running the project.

## Project Status Board
- [ ] Task 1: Project Setup
- [ ] Task 2: Privy Wallet Connection
- [ ] Task 3: Backend API Routes
- [ ] Task 4: Alchemy Token Fetching
- [ ] Task 5: Filter Tokens and Get 0x Quotes
- [ ] Task 6: Display Token Table
- [ ] Task 7: Hardhat/Foundry Setup
- [ ] Task 8: Uniswap V4 Hook Contract
- [ ] Task 9: Deploy Hook Contract
- [ ] Task 10: Uniswap V4 SDK Integration
- [ ] Task 11: Construct EIP-7702 Transaction
- [ ] Task 12: Sign and Send Transaction
- [ ] Task 13: Transaction Status and Notifications
- [ ] Task 14: Error Handling and Loading States
- [ ] Task 15: README and Environment File

## Current Status / Progress Tracking

## Executor's Feedback or Assistance Requests

## Lessons 