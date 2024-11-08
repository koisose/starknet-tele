
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/combined.css";
import { headers } from 'next/headers'
import Script from "next/script";




const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const cookies = headers().get('cookie')
  return (
    <html suppressHydrationWarning>
      <body>

          <ThemeProvider enableSystem>
            <ScaffoldEthAppWithProviders cookies={cookies}>{children}</ScaffoldEthAppWithProviders>
          </ThemeProvider>
        

        <Script src="https://telegram.org/js/telegram-web-app.js" />

      </body>
    </html>
  );
};

export default ScaffoldEthApp;
