"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { heldAbi, heldAddress } from "../lib/abi";
import { heldChain, publicClient } from "../lib/chain";
import { formatToken, shortAddress } from "../lib/format";
import { useSigner } from "../lib/useSigner";
import { ConnectButton } from "./ConnectButton";

const links = [
  { href: "/desk", label: "My agents", match: (path) => path === "/desk" },
  { href: "/desk/create", label: "Create agent", match: (path) => path === "/desk/create" },
  { href: "/desk/agents", label: "Explore agents", match: (path) => path.startsWith("/desk/agents") },
];

export const BALANCE_EVENT = "held:balance";

export function DeskShell({ children }) {
  const pathname = usePathname();
  const { address, connected, isDemo } = useSigner();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!address || !heldAddress) {
      setBalance(null);
      return undefined;
    }
    function read() {
      publicClient
        .readContract({ address: heldAddress, abi: heldAbi, functionName: "balanceOf", args: [address] })
        .then(setBalance)
        .catch(() => setBalance(null));
    }
    read();
    window.addEventListener(BALANCE_EVENT, read);
    return () => window.removeEventListener(BALANCE_EVENT, read);
  }, [address]);

  const chainName = heldChain.id === 56 ? "BNB Smart Chain" : `Local chain · ${heldChain.id}`;

  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="mark" />
          <strong>held</strong>
        </Link>
        <nav className="side-nav" aria-label="Desk">
          <p className="side-label">Desk</p>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={link.match(pathname) ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <div className="wallet-card">
            <p className="side-label">Wallet</p>
            {address ? (
              <>
                <p className="mono">{shortAddress(address)}</p>
                <p className="wallet-kind">{isDemo ? "Local demo wallet" : "Browser wallet"}</p>
                <div className="wallet-balance">
                  <span>$HELD</span>
                  <strong>{balance === null ? "—" : formatToken(balance)}</strong>
                </div>
              </>
            ) : (
              <p className="wallet-kind">No wallet connected.</p>
            )}
          </div>
          <p className="chain-tag">
            <i />
            {chainName}
          </p>
        </div>
      </aside>
      <div className="app-main">
        <div className="app-topbar">
          <Link href="/" className="topbar-back">
            ← Held home
          </Link>
          <ConnectButton className={connected ? "btn btn-ghost" : "btn btn-primary"} />
        </div>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
