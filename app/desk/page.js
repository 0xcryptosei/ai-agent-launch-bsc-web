"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "../../components/ConnectButton";
import { AgentAvatar, Empty, PageHead, Stat, StatusBadge } from "../../components/ui";
import { deskAddress } from "../../lib/abi";
import { loadAllAgents } from "../../lib/agents";
import { formatToken, launchesCovered, sameAddress } from "../../lib/format";
import { useSigner } from "../../lib/useSigner";

export default function MyAgentsPage() {
  const { address, isDemo } = useSigner();
  const [agents, setAgents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    setError("");
    loadAllAgents()
      .then((rows) => setAgents(rows.filter((agent) => sameAddress(agent.owner, address))))
      .catch(() => setError("The desk is not reachable. Start the chain, then reload."));
  }, [address]);

  const totalCredit = (agents ?? []).reduce((sum, agent) => sum + agent.credit, 0n);
  const running = (agents ?? []).filter((agent) => agent.active).length;

  return (
    <>
      <PageHead
        eyebrow="Desk"
        title="My agents"
        actions={
          <Link className="btn btn-primary" href="/desk/create">
            New agent
          </Link>
        }
      >
        Agents this wallet created on Held. Open one to burn $HELD, change its order, or read its work history.
      </PageHead>

      {!deskAddress ? <p className="notice notice-error">The desk address is not configured.</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      {!address ? (
        <Empty title="Connect a wallet" action={<ConnectButton className="btn btn-primary" />}>
          Your agents are the ones this wallet created on the Held contract.
        </Empty>
      ) : (
        <>
          {isDemo ? <p className="notice">Using the local demo wallet. Connect a browser wallet to use your own.</p> : null}
          <div className="stats">
            <Stat label="Agents" value={agents ? agents.length : "—"} />
            <Stat label="Running" value={agents ? running : "—"} hint="Order is active" />
            <Stat label="Credit" value={agents ? `${formatToken(totalCredit)} HELD` : "—"} hint="Burned, ready to spend" />
            <Stat label="Launches covered" value={agents ? launchesCovered(totalCredit) : "—"} hint="11 HELD each" />
          </div>

          {agents === null && !error ? <p className="muted">Reading the desk…</p> : null}
          {agents?.length === 0 ? (
            <Empty
              title="No agents yet"
              action={
                <Link className="btn btn-primary" href="/desk/create">
                  Create your first agent
                </Link>
              }
            >
              Creating an agent calls the Held contract. It does not launch anything on Flap.
            </Empty>
          ) : null}

          {agents?.length ? (
            <div className="table">
              <div className="table-row table-head">
                <span>Agent</span>
                <span>Status</span>
                <span>Score line</span>
                <span>Daily cap</span>
                <span>Credit</span>
                <span />
              </div>
              {agents.map((agent) => (
                <Link className="table-row" href={`/desk/agents/${agent.id}`} key={agent.id}>
                  <span className="agent-cell">
                    <AgentAvatar symbol={agent.symbol} />
                    <span>
                      <strong>{agent.name}</strong>
                      <span className="mono muted">${agent.symbol}</span>
                    </span>
                  </span>
                  <span data-label="Status">
                    <StatusBadge active={agent.active} />
                  </span>
                  <span data-label="Score line" className="mono">
                    {agent.minScore}
                  </span>
                  <span data-label="Daily cap" className="mono">
                    {agent.maxLaunchesPerDay}
                  </span>
                  <span data-label="Credit" className="mono">
                    {formatToken(agent.credit)} HELD
                  </span>
                  <span className="table-action">Manage →</span>
                </Link>
              ))}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
