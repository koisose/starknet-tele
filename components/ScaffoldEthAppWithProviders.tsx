"use client";

import { useEffect, useState,type ReactNode } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
// import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { wagmiAdapter, projectId } from "~~/services/web3/reownConfig";
import { createAppKit } from '@reown/appkit/react'
import { morphHolesky,holesky,optimismSepolia } from '@reown/appkit/networks'
const metadata = {
  name: 'morph-ai',
  description: 'Morph AI',
  url: process.env.NEXT_PUBLIC_URL as string, // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId:projectId as any,
  networks: [morphHolesky,holesky,optimismSepolia],
  defaultNetwork: optimismSepolia,
  metadata: metadata,
  features: {
    email: true, // default to true
    socials: ['google', 'github', 'farcaster'],
    emailShowWallets: true, // default to true
  }
  
})

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen">
      
        <main className="relative flex flex-col flex-1">{children}</main>
      
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children, cookies }: { children: ReactNode; cookies: string | null }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
