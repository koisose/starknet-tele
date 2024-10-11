'use client'
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/combined.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { SessionProvider } from "next-auth/react";

import Script from "next/script";
const config = {
  // For a production app, replace this with an Optimism Mainnet
  // RPC URL from a provider like Alchemy or Infura.
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "superappbot.koisose.lol",
  siweUri: "https://superappbot.koisose.lol",
 
};



const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
      <AuthKitProvider config={config}>
          <ThemeProvider enableSystem>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </ThemeProvider>
        </AuthKitProvider>

        {/* <Script src="https://telegram.org/js/telegram-web-app.js" /> */}

      </body>
    </html>
  );
};

export default ScaffoldEthApp;
