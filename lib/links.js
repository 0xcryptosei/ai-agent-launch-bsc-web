import { heldAddress } from "./abi";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);

export const xUrl = process.env.NEXT_PUBLIC_X_URL ?? "";
export const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "";
export const bscscanUrl = heldAddress
  ? chainId === 97
    ? `https://testnet.bscscan.com/token/${heldAddress}`
    : `https://bscscan.com/token/${heldAddress}`
  : "";

export function flapTokenUrl(token) {
  if (!token) return "";
  if (chainId === 97) return `https://testnet.flap.sh/bnb-testnet/${token}`;
  if (chainId === 56) return `https://flap.sh/bnb/${token}`;
  return "";
}

export const flapUrl =
  chainId === 97 ? "https://testnet.flap.sh/" : heldAddress ? flapTokenUrl(heldAddress) : "";
