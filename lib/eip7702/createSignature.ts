import {
    encodeAbiParameters,
    parseAbiParameters,
    keccak256,
  } from 'viem';
  
  /**
   * Generate an EIP-7702 signature authorizing a delegate.
   */
  export async function createEIP7702Signature({
    walletClient,
    delegateAddress,
    userAddress,
    nonce,
  }: {
    walletClient: any;
    delegateAddress: `0x${string}`;
    userAddress: `0x${string}`;
    nonce: number;
  }): Promise<`0x${string}`> {
    const encoded = encodeAbiParameters(
      parseAbiParameters('address delegate, uint256 nonce'),
      [delegateAddress, BigInt(nonce)]
    );
  
    const digest = keccak256(encoded);
  
    const signature = await walletClient.signMessage({
      account: userAddress,
      message: { raw: digest },
    });
  
    return signature;
  }
  