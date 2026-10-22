"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AgentAvatar, Empty, PageHead, Stat, StatusBadge } from "../../../components/ui";
import { deskAddress } from "../../../lib/abi";
import { loadAllAgents } from "../../../lib/agents";
import { formatToken, sameAddress, shortAddress } from "../../../lib/format";
import { useI18n } from "../../../lib/i18n";
import { useSigner } from "../../../lib/useSigner";

export default function ExplorePage() {
  const { t } = useI18n();
  const { address } = useSigner();
  const filters = [
    ["all", t.explore.all],
    ["running", t.explore.running],
    ["paused", t.explore.paused],
    ["mine", t.explore.mine],
  ];
  const [agents, setAgents] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAllAgents()
      .then(setAgents)
      .catch(() => setError(t.common.unreachable));
  }, [t]);

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
      <PageHead eyebrow={t.explore.eyebrow} title={t.explore.title}>
        {t.explore.lede}
      </PageHead>

      {!deskAddress ? <p className="notice notice-error">{t.common.noDesk}</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      <div className="stats">
        <Stat label={t.mine.agents} value={agents ? agents.length : "—"} />
        <Stat label={t.common.running} value={agents ? agents.filter((agent) => agent.active).length : "—"} />
        <Stat label={t.explore.credit} value={agents ? `${formatToken(totalCredit)} SOCIETY` : "—"} />
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder={t.explore.search}
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

      {agents === null && !error ? <p className="muted">{t.common.reading}</p> : null}
      {agents && shown.length === 0 ? <Empty title={t.explore.emptyTitle}>{t.explore.emptyCopy}</Empty> : null}

      {shown.length ? (
        <div className="table table-explore">
          <div className="table-row table-head">
            <span>{t.common.agent}</span>
            <span>{t.common.owner}</span>
            <span>{t.common.status}</span>
            <span>{t.common.scoreLine}</span>
            <span>{t.common.credit}</span>
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
              <span data-label={t.common.owner} className="mono">
                {shortAddress(agent.owner)}
                {sameAddress(agent.owner, address) ? <span className="pill">{t.common.you}</span> : null}
              </span>
              <span data-label={t.common.status}>
                <StatusBadge active={agent.active} />
              </span>
              <span data-label={t.common.scoreLine} className="mono">
                {agent.minScore}
              </span>
              <span data-label={t.common.credit} className="mono">
                {formatToken(agent.credit)} SOCIETY
              </span>
              <span className="table-action">{t.common.view}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
