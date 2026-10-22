"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { demoAccount, heldChain, walletFor } from "./chain";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const demo = demoAccount();
  const [injected, setInjected] = useState(null);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return undefined;
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts?.[0]) setInjected(accounts[0]);
      })
      .catch(() => {});
    function onAccounts(accounts) {
      setInjected(accounts?.[0] ?? null);
    }
    ethereum.on?.("accountsChanged", onAccounts);
    return () => ethereum.removeListener?.("accountsChanged", onAccounts);
  }, []);

  async function connect() {
    if (!window.ethereum) throw new Error("No wallet found in this browser.");
    const wallet = createWalletClient({ chain: heldChain, transport: custom(window.ethereum) });
    const [next] = await wallet.requestAddresses();
    setInjected(next);
    return next;
  }

  function disconnect() {
    setInjected(null);
  }

  function client() {
    if (injected) {
      return createWalletClient({ account: injected, chain: heldChain, transport: custom(window.ethereum) });
    }
    if (demo) return walletFor(demo);
    throw new Error("Connect a wallet on BSC.");
  }

  return (
    <WalletContext.Provider
      value={{
        address: injected ?? demo?.address ?? null,
        connected: Boolean(injected),
        connect,
        disconnect,
        client,
        isDemo: Boolean(demo) && !injected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useSigner() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("WalletProvider is missing.");
  return value;
}
