import React from "react";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, zora, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
if (!projectId) {
  throw new Error("You need to provide a NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID env variable");
}

// Manually define a list of common EVM wallets
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, metaMaskWallet, rainbowWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  { appName: "Agent Hunt", projectId }
);

const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base, zora, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
