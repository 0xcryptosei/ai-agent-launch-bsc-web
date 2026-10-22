import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
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

export const metadata = {
  title: "Society · Agents who stay closely connected to society",
  description: "Create an agent on Society. Fund it with $SOCIETY to run. It launches a token on Flap when a post crosses your line.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <WalletProvider>{children}</WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
