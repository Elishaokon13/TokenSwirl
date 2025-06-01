# TokenSwirl

A decentralized application (dApp) built with Next.js, showcasing wallet connection, token balance fetching, and EIP-7702 batch swap transactions on the Base network.

## Features

*   **Wallet Connection:** Seamlessly connect wallets using Privy.
*   **Token Balances:** Fetch and display ERC20 token balances using Viem and Alchemy SDK.
*   **EIP-7702 Batch Swap:** Execute batch swap transactions via a smart contract using EIP-7702 signatures.
*   **User Interface:** Built with React and styled using Shadcn UI components.
*   **Notifications:** Transaction feedback using Sonner toasts.
*   **Theme Toggle:** Light and dark mode support.

## Technologies Used

*   [Next.js](https://nextjs.org/)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Privy](https://privy.io/)
*   [Wagmi](https://wagmi.sh/)
*   [Viem](https://viem.sh/)
*   [Alchemy SDK](https://docs.alchemy.com/reference/alchemy-sdk)
*   [Shadcn UI](https://ui.shadcn.com/)
*   [Sonner](https://sonner.emilkowal.ski/)
*   [Headless UI](https://headlessui.com/)
*   [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   Yarn or npm
*   Git
*   An [Alchemy](https://www.alchemy.com/) account and API key (for fetching token balances).
*   A [Privy](https://privy.io/) account and App ID (for wallet authentication).
*   A deployed instance of the `BatchSwapToUSDC` smart contract on the Base network (or your target network).

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd TokenSwirl
    ```
2.  Install dependencies:
    ```bash
    yarn install
    # or
    npm install
    ```
3.  Add Shadcn UI components (if not already added):
    ```bash
    npx shadcn-ui@latest add button
    npx shadcn-ui@latest add card
    # ... add any other used components like input, label, etc.
    ```
    Follow the prompts to configure Shadcn UI for your project.

### Configuration

1.  Create a `.env.local` file in the root of your project based on the `.env.example` (if available) or manually add the following variables:

    ```env
    NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
    NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
    ```
    Replace `your_privy_app_id` and `your_alchemy_api_key` with your actual credentials.

2.  Update the smart contract address:

    Edit the `CONTRACT_ADDRESS` constant in `hooks/useEIP7702Swap.ts` and `hooks/useBatchSwap.ts` with the address of your deployed `BatchSwapToUSDC` contract.

    ```typescript
    // hooks/useEIP7702Swap.ts and hooks/useBatchSwap.ts
    const CONTRACT_ADDRESS = "0xYourDeployedContractAddress" as const; // Replace with your contract address
    ```

3.  Ensure the contract ABI is in place:

    Make sure the compiled JSON ABI of your `BatchSwapToUSDC` contract is located at `contracts/BatchSwapToUSDC.json`. This file should contain the JSON array representing the ABI.

### Running the Project

To run the development server:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

(Describe how to use the application, e.g., Connect Wallet button, Batch Swap form, etc.)

## Project Structure

*   `components/`: Reusable UI components (e.g., WalletDropdown, BatchSwapForm).
*   `hooks/`: Custom React hooks for logic (e.g., useWallets, useTokenBalances, useEIP7702Swap).
*   `lib/`: Utility functions or configurations (e.g., wagmi setup, Alchemy client).
*   `pages/`: Next.js pages.
*   `utils/`: Helper functions (e.g., EIP-712 payload generation).
*   `contracts/`: Contract ABIs (e.g., BatchSwapToUSDC.json).

