// components/ConnectWallet.tsx
'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ConnectWallet() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const connectedWallet = wallets.find((w) => w.connectedAt);

  if (!ready) return null;

  return (
    <Card className="w-full max-w-sm mx-auto mt-12 p-4">
      <CardContent className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">
          {authenticated ? 'Wallet Connected' : 'Connect Your Wallet'}
        </h2>

        {authenticated && connectedWallet ? (
          <>
            <p className="text-muted-foreground text-sm truncate">
              {connectedWallet.address}
            </p>
            <Button variant="destructive" onClick={logout}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={login}>Connect Wallet</Button>
        )}
      </CardContent>
    </Card>
  );
}
