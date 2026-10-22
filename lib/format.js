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

export function timeAgo(iso, lang = "en") {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const n = seconds < 60 ? seconds : seconds < 3600 ? Math.round(seconds / 60) : seconds < 86400 ? Math.round(seconds / 3600) : Math.round(seconds / 86400);
  if (lang === "zh") {
    const unit = seconds < 60 ? "秒" : seconds < 3600 ? "分钟" : seconds < 86400 ? "小时" : "天";
    return `${n}${unit}前`;
  }
  const unit = seconds < 60 ? "s" : seconds < 3600 ? "m" : seconds < 86400 ? "h" : "d";
  return `${n}${unit} ago`;
}
