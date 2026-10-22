"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "../../components/ConnectButton";
import { AgentAvatar, Empty, PageHead, Stat, StatusBadge } from "../../components/ui";
import { deskAddress } from "../../lib/abi";
import { loadAllAgents } from "../../lib/agents";
import { formatToken, launchesCovered, sameAddress } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { useSigner } from "../../lib/useSigner";

export default function MyAgentsPage() {
  const { t } = useI18n();
  const { address, isDemo } = useSigner();
  const [agents, setAgents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    setError("");
    loadAllAgents()
      .then((rows) => setAgents(rows.filter((agent) => sameAddress(agent.owner, address))))
      .catch(() => setError(t.common.unreachable));
  }, [address, t]);

  const totalCredit = (agents ?? []).reduce((sum, agent) => sum + agent.credit, 0n);
  const running = (agents ?? []).filter((agent) => agent.active).length;

  return (
    <>
      <PageHead
        eyebrow={t.desk.label}
        title={t.mine.title}
        actions={
          <Link className="btn btn-primary" href="/desk/create">
            {t.mine.new}
          </Link>
        }
      >
        {t.mine.lede}
      </PageHead>

      {!deskAddress ? <p className="notice notice-error">{t.common.noDesk}</p> : null}
      {error ? <p className="notice notice-error">{error}</p> : null}

      {!address ? (
        <Empty title={t.mine.connectTitle} action={<ConnectButton className="btn btn-primary" />}>
          {t.mine.connectCopy}
        </Empty>
      ) : (
        <>
          {isDemo ? <p className="notice">{t.mine.demo}</p> : null}
          <div className="stats">
            <Stat label={t.mine.agents} value={agents ? agents.length : "—"} />
            <Stat label={t.common.running} value={agents ? running : "—"} hint={t.common.activeHint} />
            <Stat label={t.common.credit} value={agents ? `${formatToken(totalCredit)} SOCIETY` : "—"} hint={t.common.burnedReady} />
            <Stat label={t.mine.launches} value={agents ? launchesCovered(totalCredit) : "—"} hint={t.common.launchesEach} />
          </div>

          {agents === null && !error ? <p className="muted">{t.common.reading}</p> : null}
          {agents?.length === 0 ? (
            <Empty
              title={t.mine.emptyTitle}
              action={
                <Link className="btn btn-primary" href="/desk/create">
                  {t.mine.emptyAction}
                </Link>
              }
            >
              {t.mine.emptyCopy}
            </Empty>
          ) : null}

          {agents?.length ? (
            <div className="table">
              <div className="table-row table-head">
                <span>{t.common.agent}</span>
                <span>{t.common.status}</span>
                <span>{t.common.scoreLine}</span>
                <span>{t.common.dailyCap}</span>
                <span>{t.common.credit}</span>
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
                  <span data-label={t.common.status}>
                    <StatusBadge active={agent.active} />
                  </span>
                  <span data-label={t.common.scoreLine} className="mono">
                    {agent.minScore}
                  </span>
                  <span data-label={t.common.dailyCap} className="mono">
                    {agent.maxLaunchesPerDay}
                  </span>
                  <span data-label={t.common.credit} className="mono">
                    {formatToken(agent.credit)} SOCIETY
                  </span>
                  <span className="table-action">{t.common.manage}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
