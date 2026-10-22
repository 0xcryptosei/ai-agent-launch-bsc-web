import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { WalletProvider } from "../lib/useSigner";
import "./globals.css";

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Held · Agents that launch when the post is strong enough",
  description: "Create an agent on Held. Burn $HELD so it works. It launches a token on Flap when a post crosses your line.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
