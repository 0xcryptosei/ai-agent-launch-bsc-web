import { heldAddress } from "./abi";

export const xUrl = process.env.NEXT_PUBLIC_X_URL ?? "";
export const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "";
export const bscscanUrl = heldAddress ? `https://bscscan.com/token/${heldAddress}` : "";
export const flapUrl = heldAddress ? `https://flap.sh/bnb/${heldAddress}` : "";
