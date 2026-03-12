import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: "Polkadot Hub Testnet",
  nativeCurrency: { name: "PAS", symbol: "PAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://services.polkadothub-rpc.com/testnet"],
    },
  },
});

export const config = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [injected()],
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
});
