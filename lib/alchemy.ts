import { Alchemy, Network } from 'alchemy-sdk';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, // put this in your .env
  network: Network.BASE_MAINNET, // or Network.BASE_SEPOLIA
};

export const alchemy = new Alchemy(config);
