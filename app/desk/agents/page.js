"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AgentAvatar, Empty, PageHead, Stat, StatusBadge } from "../../../components/ui";
import { deskAddress } from "../../../lib/abi";
import { loadAllAgents } from "../../../lib/agents";
import { formatToken, sameAddress, shortAddress } from "../../../lib/format";
import { useSigner } from "../../../lib/useSigner";

const filters = [
  ["all", "All"],
  ["running", "Running"],
  ["paused", "Paused"],
  ["mine", "Mine"],
];

export default function ExplorePage() {
  const { address } = useSigner();
  const [agents, setAgents] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAllAgents()
      .then(setAgents)
      .catch(() => setError("The desk is not reachable. Start the chain, then reload."));
  }, []);

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (agents ?? []).filter((agent) => {
      if (filter === "running" && !agent.active) return false;
      if (filter === "paused" && agent.active) return false;
      if (filter === "mine" && !sameAddress(agent.owner, address)) return false;
      if (!needle) return true;
      return [agent.name, agent.symbol, agent.owner].some((value) => value?.toLowerCase().includes(needle));
    });
  }, [agents, address, filter, search]);

  const totalCredit = (agents ?? []).reduce((sum, agent) => sum + agent.credit, 0n);

  return (
    <>
      <PageHead eyebrow="Explore" title="Agents on Held">
        Every agent the Held contract has created. Anyone can open an agent and read its order and work history.
      </PageHead>

      {!deskAddress ? <p className="notice notice-error">The desk address is not configured.</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      <div className="stats">
        <Stat label="Agents" value={agents ? agents.length : "—"} />
        <Stat label="Running" value={agents ? agents.filter((agent) => agent.active).length : "—"} />
        <Stat label="Credit on the desk" value={agents ? `${formatToken(totalCredit)} HELD` : "—"} />
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by name, symbol, or owner"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="segmented" role="tablist">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={filter === value ? "active" : undefined}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {agents === null && !error ? <p className="muted">Reading the desk…</p> : null}
      {agents && shown.length === 0 ? <Empty title="No agents match">Try another search or filter.</Empty> : null}

      {shown.length ? (
        <div className="table table-explore">
          <div className="table-row table-head">
            <span>Agent</span>
            <span>Owner</span>
            <span>Status</span>
            <span>Score line</span>
            <span>Credit</span>
            <span />
          </div>
          {shown.map((agent) => (
            <Link className="table-row" href={`/desk/agents/${agent.id}`} key={agent.id}>
              <span className="agent-cell">
                <AgentAvatar symbol={agent.symbol} />
                <span>
                  <strong>{agent.name}</strong>
                  <span className="mono muted">${agent.symbol}</span>
                </span>
              </span>
              <span data-label="Owner" className="mono">
                {shortAddress(agent.owner)}
                {sameAddress(agent.owner, address) ? <span className="pill">You</span> : null}
              </span>
              <span data-label="Status">
                <StatusBadge active={agent.active} />
              </span>
              <span data-label="Score line" className="mono">
                {agent.minScore}
              </span>
              <span data-label="Credit" className="mono">
                {formatToken(agent.credit)} HELD
              </span>
              <span className="table-action">View →</span>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
