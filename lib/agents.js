"use client";

import { asAgent, deskAbi, deskAddress } from "./abi";
import { publicClient } from "./chain";

export async function loadAllAgents() {
  if (!deskAddress) return [];
  const count = await publicClient.readContract({
    address: deskAddress,
    abi: deskAbi,
    functionName: "agentCount",
  });
  const agents = [];
  for (let i = 0n; i < count; i++) {
    const row = await publicClient.readContract({
      address: deskAddress,
      abi: deskAbi,
      functionName: "getAgent",
      args: [i],
    });
    agents.push({ id: i.toString(), ...asAgent(row) });
  }
  return agents;
}
