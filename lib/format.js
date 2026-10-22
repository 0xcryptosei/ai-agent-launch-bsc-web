import { formatEther } from "viem";

export const WATCH_HELD = 1;
export const LAUNCH_HELD = 10;

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatToken(wei, digits = 2) {
  const value = Number(formatEther(wei ?? 0n));
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function watchesCovered(credit) {
  return Math.floor(Number(formatEther(credit ?? 0n)) / WATCH_HELD);
}

export function launchesCovered(credit) {
  return Math.floor(Number(formatEther(credit ?? 0n)) / (WATCH_HELD + LAUNCH_HELD));
}

export function sameAddress(a, b) {
  return Boolean(a && b) && a.toLowerCase() === b.toLowerCase();
}

export function timeAgo(iso) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}
