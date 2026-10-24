"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatEther, keccak256, parseEther, stringToBytes, zeroAddress } from "viem";
import { BALANCE_EVENT } from "../../../../components/DeskShell";
import { AgentAvatar, CopyText, Empty, ScoreBar, Stat, StatusBadge } from "../../../../components/ui";
import { apiUrl, asAgent, deskAbi, deskAddress, heldAbi, heldAddress } from "../../../../lib/abi";
import { publicClient } from "../../../../lib/chain";
import {
  formatToken,
  launchesCovered,
  sameAddress,
  shortAddress,
  timeAgo,
  watchesCovered,
} from "../../../../lib/format";
import { useI18n } from "../../../../lib/i18n";
import { flapTokenUrl } from "../../../../lib/links";
import { useSigner } from "../../../../lib/useSigner";

export default function AgentPage() {
  const { t, lang } = useI18n();
  const tabs = [
    ["history", t.agent.history],
    ["order", t.agent.order],
    ["contracts", t.agent.addresses],
  ];
  const statusLabel = { sent: t.agent.launched, preview: t.agent.preview, failed: t.agent.failed };
  const params = useParams();
  const id = params.id;
  const [onchain, setOnchain] = useState(null);
  const [record, setRecord] = useState(null);
  const [balance, setBalance] = useState(null);
  const [ownerBnb, setOwnerBnb] = useState(null);
  const [launchBnb, setLaunchBnb] = useState(null);
  const [burn, setBurn] = useState("20");
  const [deposit, setDeposit] = useState("0.05");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("history");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [exported, setExported] = useState("");
  const { address, client } = useSigner();

  const load = useCallback(async () => {
    if (!deskAddress) return;
    const agent = await publicClient.readContract({
      address: deskAddress,
      abi: deskAbi,
      functionName: "getAgent",
      args: [BigInt(id)],
    });
    const parsed = asAgent(agent);
    setOnchain(parsed);
    if (address && heldAddress) {
      const heldBalance = await publicClient.readContract({
        address: heldAddress,
        abi: heldAbi,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(heldBalance);
    } else {
      setBalance(null);
    }
    if (address) {
      setOwnerBnb(await publicClient.getBalance({ address }));
    } else {
      setOwnerBnb(null);
    }
    if (parsed.launchWallet && parsed.launchWallet !== zeroAddress) {
      setLaunchBnb(await publicClient.getBalance({ address: parsed.launchWallet }));
    } else {
      setLaunchBnb(null);
    }
    const response = await fetch(`${apiUrl}/api/agents/${id}`).catch(() => null);
    if (response?.ok) {
      const body = await response.json();
      setRecord(body);
      setQuery(body.query ?? "");
    }
  }, [address, id]);

  useEffect(() => {
    load().catch((err) => setError(err.shortMessage || err.message));
  }, [load]);

  function begin() {
    setBusy(true);
    setError("");
    setStatus("");
  }

  async function depositToLaunchWallet(event) {
    event.preventDefault();
    begin();
    try {
      const wallet = client();
      const to = onchain?.launchWallet;
      if (!to || to === zeroAddress) throw new Error(t.agent.noLaunchWallet);
      let amount;
      try {
        amount = parseEther(deposit);
      } catch {
        throw new Error(t.agent.depositInvalid);
      }
      if (amount <= 0n) throw new Error(t.agent.depositInvalid);
      const walletBalance = await publicClient.getBalance({ address });
      if (walletBalance < amount) throw new Error(t.agent.depositTooMuch);
      setStatus(t.agent.depositing);
      const hash = await wallet.sendTransaction({ to, value: amount });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(t.agent.deposited.replace("{amount}", deposit));
      await load();
    } catch (err) {
      setError(err.shortMessage || err.message);
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function fundAgent(event) {
    event.preventDefault();
    begin();
    try {
      const wallet = client();
      const amount = parseEther(burn);
      const allowance = await publicClient.readContract({
        address: heldAddress,
        abi: heldAbi,
        functionName: "allowance",
        args: [address, deskAddress],
      });
      if (allowance < amount) {
        setStatus(t.agent.approving);
        const approveHash = await wallet.writeContract({
          address: heldAddress,
          abi: heldAbi,
          functionName: "approve",
          args: [deskAddress, amount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      setStatus(t.agent.burning);
      const hash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "fundAgent",
        args: [BigInt(id), amount],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(t.agent.burned.replace("{amount}", burn));
      window.dispatchEvent(new Event(BALANCE_EVENT));
      await load();
    } catch (err) {
      setError(err.shortMessage || err.message);
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function saveQuery(event) {
    event.preventDefault();
    begin();
    try {
      const token = window.localStorage.getItem(`held-export-${id}`);
      if (!token) throw new Error(t.agent.noExport);
      const updated = await fetch(`${apiUrl}/api/agents/${id}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, exportToken: token }),
      }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body;
      });
      const wallet = client();
      const hash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "setOrder",
        args: [
          BigInt(id),
          onchain.minScore,
          onchain.maxLaunchesPerDay,
          onchain.maxBuyWei,
          keccak256(stringToBytes(query.trim())),
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      if (updated.queryHash.toLowerCase() !== keccak256(stringToBytes(query.trim())).toLowerCase()) {
        throw new Error(t.agent.mismatch);
      }
      setStatus(onchain.active ? t.agent.updated : t.agent.resumed);
      await load();
    } catch (err) {
      setError(err.shortMessage || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function pause() {
    begin();
    try {
      const hash = await client().writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "pauseOrder",
        args: [BigInt(id)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(t.agent.paused);
      await load();
    } catch (err) {
      setError(err.shortMessage || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function revealKey() {
    setError("");
    const token = window.localStorage.getItem(`held-export-${id}`);
    if (!token) {
      setError(t.agent.noExport);
      return;
    }
    const response = await fetch(`${apiUrl}/api/agents/${id}/key`, { headers: { "X-Export-Token": token } });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setExported(body.privateKey);
  }

  if (!onchain) {
    return (
      <div className="agent-loading">
        {error ? <p className="notice notice-error">{error}</p> : <p className="muted">{t.agent.loading}</p>}
        <Link className="btn btn-ghost" href="/desk/agents">
          {t.agent.back}
        </Link>
      </div>
    );
  }

  const isOwner = sameAddress(address, onchain.owner);
  const launches = record?.launches ?? [];

  return (
    <>
      <Link className="back-link" href="/desk/agents">
        {t.agent.all}
      </Link>

      <header className="agent-head">
        <AgentAvatar symbol={onchain.symbol} size="xl" />
        <div className="agent-title">
          <div className="row">
            <h1>{onchain.name}</h1>
            <span className="chip mono">${onchain.symbol}</span>
            <StatusBadge active={onchain.active} />
          </div>
          <p className="muted">
            Agent #{id} · {t.agent.createdBy} <span className="mono">{shortAddress(onchain.owner)}</span>
            {isOwner ? <span className="pill">{t.common.you}</span> : null}
          </p>
        </div>
      </header>

      <div className="stats stats-6">
        <Stat label={t.common.credit} value={`${formatToken(onchain.credit)} SOCIETY`} hint={t.common.burnedReady} />
        <Stat label={t.agent.watches} value={watchesCovered(onchain.credit)} hint={t.agent.watchesHint} />
        <Stat label={t.agent.launches} value={launchesCovered(onchain.credit)} hint={t.agent.launchesHint} />
        <Stat label={t.common.scoreLine} value={`${onchain.minScore} / 100`} />
        <Stat label={t.common.dailyCap} value={onchain.maxLaunchesPerDay} hint={t.agent.perDayHint} />
        <Stat label={t.agent.maxBuy} value={`${formatToken(onchain.maxBuyWei, 4)} BNB`} />
        <Stat
          label={t.agent.launchBalance}
          value={launchBnb === null ? "—" : `${formatToken(launchBnb, 4)} BNB`}
          hint={t.agent.launchBalanceHint}
        />
      </div>

      <div className="agent-layout">
        <section className="panel">
          <div className="tabs" role="tablist">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                className={tab === value ? "active" : undefined}
                onClick={() => setTab(value)}
              >
                {label}
                {value === "history" && launches.length ? <span className="tab-count">{launches.length}</span> : null}
              </button>
            ))}
          </div>

          {tab === "history" ? (
            <>
              {record?.lastReason ? (
                <div className="last-pass">
                  <span className="side-label">{t.agent.lastPass}</span>
                  <p>{record.lastReason}</p>
                </div>
              ) : null}
              {launches.length ? (
                <ol className="timeline">
                  {launches.map((launch) => (
                    <li key={`${launch.postId}-${launch.at}`} className={`timeline-${launch.status}`}>
                      <span className="timeline-dot" />
                      <div className="timeline-body">
                        <div className="row-between">
                          <strong>
                            {launch.name} <span className="mono muted">${launch.symbol}</span>
                          </strong>
                          <span className={`pill pill-${launch.status}`}>{statusLabel[launch.status] ?? launch.status}</span>
                        </div>
                        {launch.post ? <blockquote>{launch.post}</blockquote> : null}
                        <div className="timeline-score">
                          <ScoreBar value={launch.score} line={onchain.minScore} />
                          <span className="mono">{launch.score}</span>
                        </div>
                        <p className="muted">{launch.reason}</p>
                        <div className="timeline-meta">
                          {launch.at ? <span>{timeAgo(launch.at, lang)}</span> : null}
                          {launch.sample ? <span>{t.agent.sample}</span> : null}
                          {launch.token ? (
                            <span className="mono">
                              {launch.status === "sent" ? t.agent.token : t.agent.predicted} {shortAddress(launch.token)}
                            </span>
                          ) : null}
                          {launch.status === "sent" && flapTokenUrl(launch.token) ? (
                            <a href={flapTokenUrl(launch.token)} target="_blank" rel="noreferrer">
                              {t.agent.flap}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty title={t.agent.noWork}>
                  {onchain.credit > 0n ? t.agent.hasCredit : t.agent.needBurn}
                </Empty>
              )}
            </>
          ) : null}

          {tab === "order" ? (
            <dl className="kv kv-wide">
              <div>
                <dt>{t.common.status}</dt>
                <dd>
                  <StatusBadge active={onchain.active} />
                </dd>
              </div>
              <div>
                <dt>{t.agent.watchList}</dt>
                <dd>{record?.query || <span className="muted">{t.agent.stored}</span>}</dd>
              </div>
              <div>
                <dt>{t.common.scoreLine}</dt>
                <dd className="score-dd">
                  <ScoreBar value={onchain.minScore} />
                  <span className="mono">{onchain.minScore}</span>
                </dd>
              </div>
              <div>
                <dt>{t.create.perDay}</dt>
                <dd className="mono">{onchain.maxLaunchesPerDay}</dd>
              </div>
              <div>
                <dt>{t.agent.maxBuy}</dt>
                <dd className="mono">{formatEther(onchain.maxBuyWei)} BNB</dd>
              </div>
              <div>
                <dt>{t.agent.hash}</dt>
                <dd>
                  <CopyText value={onchain.queryHash} short={shortAddress(onchain.queryHash)} />
                </dd>
              </div>
            </dl>
          ) : null}

          {tab === "contracts" ? (
            <dl className="kv kv-wide">
              <div>
                <dt>{t.agent.meme}</dt>
                <dd>
                  <CopyText value={onchain.meme} />
                </dd>
              </div>
              <div>
                <dt>{t.common.owner}</dt>
                <dd>
                  <CopyText value={onchain.owner} />
                </dd>
              </div>
              <div>
                <dt>{t.agent.launchWallet}</dt>
                <dd>
                  <CopyText value={onchain.launchWallet} />
                </dd>
              </div>
              <div>
                <dt>{t.agent.image}</dt>
                <dd className="break">{onchain.metaUri || <span className="muted">{t.agent.none}</span>}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <aside className="agent-side">
          {isOwner ? (
            <>
              <form className="panel" onSubmit={fundAgent}>
                <div className="row-between">
                  <h3>{t.agent.burnTitle}</h3>
                  <span className="muted small">
                    {t.agent.balance} <span className="mono">{balance === null ? "—" : formatToken(balance)}</span>
                  </span>
                </div>
                <p className="muted small">{t.agent.burnCopy}</p>
                <span className="input-suffix">
                  <input className="mono" inputMode="decimal" value={burn} onChange={(event) => setBurn(event.target.value)} />
                  <em>SOCIETY</em>
                </span>
                <div className="chips">
                  {["11", "22", "55", "110"].map((value) => (
                    <button key={value} type="button" className="chip-btn" onClick={() => setBurn(value)}>
                      {value}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-block" disabled={busy} type="submit">
                  {t.agent.burnBtn}
                </button>
              </form>

              <form className="panel" onSubmit={depositToLaunchWallet}>
                <div className="row-between">
                  <h3>{t.agent.depositTitle}</h3>
                  <span className="muted small">
                    {t.agent.yourBnb} <span className="mono">{ownerBnb === null ? "—" : formatToken(ownerBnb, 4)}</span>
                  </span>
                </div>
                <p className="muted small">{t.agent.depositCopy}</p>
                {onchain.launchWallet && onchain.launchWallet !== zeroAddress ? (
                  <p className="muted small">
                    {t.agent.launchWallet}{" "}
                    <CopyText value={onchain.launchWallet} short={shortAddress(onchain.launchWallet)} />
                  </p>
                ) : null}
                <span className="input-suffix">
                  <input
                    className="mono"
                    inputMode="decimal"
                    value={deposit}
                    onChange={(event) => setDeposit(event.target.value)}
                    disabled={!onchain.launchWallet || onchain.launchWallet === zeroAddress}
                  />
                  <em>BNB</em>
                </span>
                <div className="chips">
                  {["0.01", "0.05", "0.1", "0.5"].map((value) => (
                    <button key={value} type="button" className="chip-btn" onClick={() => setDeposit(value)}>
                      {value}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-dark btn-block"
                  disabled={busy || !onchain.launchWallet || onchain.launchWallet === zeroAddress}
                  type="submit"
                >
                  {t.agent.depositBtn}
                </button>
              </form>

              <form className="panel" onSubmit={saveQuery}>
                <h3>{t.agent.watchList}</h3>
                <p className="muted small">{t.agent.watchCopy}</p>
                <textarea value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="row">
                  <button className="btn btn-dark" disabled={busy} type="submit">
                    {t.agent.save}
                  </button>
                  <button className="btn btn-ghost" disabled={busy || !onchain.active} type="button" onClick={pause}>
                    {t.agent.pause}
                  </button>
                </div>
              </form>

              <div className="panel panel-danger">
                <h3>{t.agent.key}</h3>
                <p className="muted small">{t.agent.keyCopy}</p>
                {exported ? (
                  <CopyText value={exported} short={`${exported.slice(0, 10)}…${exported.slice(-6)}`} />
                ) : (
                  <button className="btn btn-ghost" type="button" onClick={revealKey}>
                    {t.agent.export}
                  </button>
                )}
              </div>

              {error ? <p className="notice notice-error">{error}</p> : null}
              {status ? <p className="notice notice-ok">{status}</p> : null}
            </>
          ) : (
            <div className="panel">
              <h3>{t.agent.readOnly}</h3>
              <p className="muted small">
                {t.agent.readCopy} <span className="mono">{shortAddress(onchain.owner)}</span>.
              </p>
              {error ? <p className="notice notice-error">{error}</p> : null}
              <Link className="btn btn-primary btn-block" href="/desk/create">
                {t.agent.own}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
