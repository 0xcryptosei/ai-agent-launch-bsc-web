"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { heldAbi, heldAddress } from "../lib/abi";
import { heldChain, publicClient } from "../lib/chain";
import { formatToken, shortAddress } from "../lib/format";
import { useSigner } from "../lib/useSigner";
import { useI18n } from "../lib/i18n";
import { ConnectButton } from "./ConnectButton";
import { LanguageToggle } from "./LanguageToggle";

export const BALANCE_EVENT = "held:balance";

export function DeskShell({ children }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { address, connected, isDemo } = useSigner();
  const links = [
    { href: "/desk", label: t.desk.mine, match: (path) => path === "/desk" },
    { href: "/desk/create", label: t.desk.create, match: (path) => path === "/desk/create" },
    { href: "/desk/agents", label: t.desk.explore, match: (path) => path.startsWith("/desk/agents") },
  ];
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

  const chainName = heldChain.id === 56 ? t.desk.bsc : `${t.desk.local} · ${heldChain.id}`;

  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="mark" />
          <strong>Society</strong>
        </Link>
        <nav className="side-nav" aria-label={t.desk.label}>
          <p className="side-label">{t.desk.label}</p>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={link.match(pathname) ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <div className="wallet-card">
            <p className="side-label">{t.desk.wallet}</p>
            {address ? (
              <>
                <p className="mono">{shortAddress(address)}</p>
                <p className="wallet-kind">{isDemo ? t.desk.demo : t.desk.browser}</p>
                <div className="wallet-balance">
                  <span>$SOCIETY</span>
                  <strong>{balance === null ? "—" : formatToken(balance)}</strong>
                </div>
              </>
            ) : (
              <p className="wallet-kind">{t.desk.none}</p>
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
            {t.desk.home}
          </Link>
          <div className="row">
            <LanguageToggle />
            <ConnectButton className={connected ? "btn btn-ghost" : "btn btn-primary"} />
          </div>
        </div>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
