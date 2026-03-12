"use client";

import { useConnection, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { polkadotHubTestnet } from "@/config/wagmi";

export function ConnectWallet() {
  const { address, chain, isConnected } = useConnection();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  const isWrongChain = isConnected && chain?.id !== polkadotHubTestnet.id;

  if (isConnected && isWrongChain) {
    return (
      <div className="wallet-info">
        <span className="chain-name">Wrong network</span>
        <button onClick={() => switchChain.mutate({ chainId: polkadotHubTestnet.id })}>
          Switch to {polkadotHubTestnet.name}
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="wallet-info">
        <span>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {chain && <span className="chain-name">{chain.name}</span>}
        <button onClick={() => disconnect.mutate()}>Disconnect</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect.mutate({ connector: injected(), chainId: polkadotHubTestnet.id })}
      disabled={connect.isPending}
    >
      {connect.isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
