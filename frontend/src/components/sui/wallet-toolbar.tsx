"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletToolbar() {
  const account = useCurrentAccount();

  if (!account) {
    return <ConnectButton connectText="Connect wallet" />;
  }

  return (
    <div className="rounded-md border border-foreground/10 px-3 py-2 text-xs font-mono text-foreground/80">
      {account.address.slice(0, 6)}…{account.address.slice(-4)}
    </div>
  );
}
