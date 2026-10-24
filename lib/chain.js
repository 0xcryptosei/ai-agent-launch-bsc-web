"use client";

import { createPublicClient, createWalletClient, custom, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);

function chainFromEnv() {
  if (chainId === 56) return bsc;
  if (chainId === 97) return { ...bscTestnet, rpcUrls: { default: { http: [rpcUrl] } } };
  return defineChain({
    id: chainId,
    name: chainId === 31337 ? "Local" : `Chain ${chainId}`,
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });
}

export const heldChain = chainFromEnv();

export const publicClient = createPublicClient({
  chain: heldChain,
  transport: http(rpcUrl),
});

export function demoAccount() {
  if (process.env.NEXT_PUBLIC_DEMO !== "1" || !process.env.NEXT_PUBLIC_DEMO_KEY) return null;
  return privateKeyToAccount(process.env.NEXT_PUBLIC_DEMO_KEY);
}

export function walletFor(account) {
  return createWalletClient({
    account,
    chain: heldChain,
    transport: http(rpcUrl),
  });
}

export async function connectInjected() {
  if (!window.ethereum) throw new Error("No wallet found in this browser.");
  const wallet = createWalletClient({
    chain: heldChain,
    transport: custom(window.ethereum),
  });
  const [address] = await wallet.requestAddresses();
  return { wallet, address };
}
