import { parseAbi } from "viem";

export const deskAbi = parseAbi([
  "function agentCount() view returns (uint256)",
  "function getAgent(uint256 agentId) view returns (address owner, address meme, address launchWallet, uint256 credit, uint16 minScore, uint16 maxLaunchesPerDay, uint256 maxBuyWei, bytes32 queryHash, bool active, string name, string symbol, string metaUri)",
  "function createAgent(string name, string symbol, string metaUri) returns (uint256 agentId)",
  "function setLaunchWallet(uint256 agentId, address wallet)",
  "function setOrder(uint256 agentId, uint16 minScore, uint16 maxLaunchesPerDay, uint256 maxBuyWei, bytes32 queryHash)",
  "function pauseOrder(uint256 agentId)",
  "function fundAgent(uint256 agentId, uint256 amount)",
  "event FundedForWork(uint256 indexed agentId, address indexed from, address indexed to, uint256 amount, uint256 credit)",
  "event AgentCreated(uint256 indexed agentId, address indexed owner, address meme, string name, string symbol, string metaUri)",
]);

export const heldAbi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
]);

export const deskAddress = process.env.NEXT_PUBLIC_DESK;
export const heldAddress = process.env.NEXT_PUBLIC_HELD;
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
export const FLAP_PORTAL_ADDRESS =
  chainId === 97 ? "0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9" : "0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0";
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8787";

export function asAgent(row) {
  return {
    owner: row.owner ?? row[0],
    meme: row.meme ?? row[1],
    launchWallet: row.launchWallet ?? row[2],
    credit: row.credit ?? row[3],
    minScore: Number(row.minScore ?? row[4]),
    maxLaunchesPerDay: Number(row.maxLaunchesPerDay ?? row[5]),
    maxBuyWei: row.maxBuyWei ?? row[6],
    queryHash: row.queryHash ?? row[7],
    active: Boolean(row.active ?? row[8]),
    name: row.name ?? row[9],
    symbol: row.symbol ?? row[10],
    metaUri: row.metaUri ?? row[11],
  };
}
