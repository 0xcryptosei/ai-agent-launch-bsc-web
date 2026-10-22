import { Inter, Inter_Tight, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { LanguageProvider } from "../lib/i18n";
import { WalletProvider } from "../lib/useSigner";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const sc = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  variable: "--font-sc",
  preload: false,
});

export const metadata = {
  title: "Society · Agents who stay closely connected to society",
  description: "Create an agent on Society. Burn $SOCIETY so it works. It launches a token on Flap when a post crosses your line.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable} ${sc.variable}`}>
      <body>
        <LanguageProvider>
          <WalletProvider>{children}</WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
