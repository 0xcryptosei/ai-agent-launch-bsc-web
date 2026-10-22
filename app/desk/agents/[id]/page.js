"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatEther, keccak256, parseEther, stringToBytes } from "viem";
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
import { useSigner } from "../../../../lib/useSigner";

const TABS = [
  ["history", "Work history"],
  ["order", "Order"],
  ["contracts", "Addresses"],
];

const STATUS_LABEL = { sent: "Launched", preview: "Preview", failed: "Failed" };

export default function AgentPage() {
  const params = useParams();
  const id = params.id;
  const [onchain, setOnchain] = useState(null);
  const [record, setRecord] = useState(null);
  const [balance, setBalance] = useState(null);
  const [burn, setBurn] = useState("20");
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
    setOnchain(asAgent(agent));
    if (address && heldAddress) {
      const heldBalance = await publicClient.readContract({
        address: heldAddress,
        abi: heldAbi,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(heldBalance);
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

  async function burnForWork(event) {
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
        setStatus("Approving $HELD…");
        const approveHash = await wallet.writeContract({
          address: heldAddress,
          abi: heldAbi,
          functionName: "approve",
          args: [deskAddress, amount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      setStatus("Burning $HELD…");
      const hash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "burnForWork",
        args: [BigInt(id), amount],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(`Burned ${burn} $HELD. The agent can spend this credit.`);
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
      if (!token) throw new Error("This browser does not have the export token for this agent.");
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
        throw new Error("The saved watch list does not match the order.");
      }
      setStatus(onchain.active ? "Watch list updated." : "Watch list updated. The agent is running again.");
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
      setStatus("Agent paused. Save the watch list to run it again.");
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
      setError("This browser does not have the export token for this agent.");
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
        {error ? <p className="notice notice-error">{error}</p> : <p className="muted">Loading the agent…</p>}
        <Link className="btn btn-ghost" href="/desk/agents">
          ← Back to agents
        </Link>
      </div>
    );
  }

  const isOwner = sameAddress(address, onchain.owner);
  const launches = record?.launches ?? [];

  return (
    <>
      <Link className="back-link" href="/desk/agents">
        ← All agents
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
            Agent #{id} · created by <span className="mono">{shortAddress(onchain.owner)}</span>
            {isOwner ? <span className="pill">You</span> : null}
          </p>
        </div>
      </header>

      <div className="stats stats-6">
        <Stat label="Credit" value={`${formatToken(onchain.credit)} HELD`} hint="Burned, ready to spend" />
        <Stat label="Watches covered" value={watchesCovered(onchain.credit)} hint="1 HELD each" />
        <Stat label="Launches covered" value={launchesCovered(onchain.credit)} hint="11 HELD with the watch" />
        <Stat label="Score line" value={`${onchain.minScore} / 100`} />
        <Stat label="Daily cap" value={onchain.maxLaunchesPerDay} hint="Launches per day" />
        <Stat label="Max first buy" value={`${formatToken(onchain.maxBuyWei, 4)} BNB`} />
      </div>

      <div className="agent-layout">
        <section className="panel">
          <div className="tabs" role="tablist">
            {TABS.map(([value, label]) => (
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
                  <span className="side-label">Last pass</span>
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
                          <span className={`pill pill-${launch.status}`}>{STATUS_LABEL[launch.status] ?? launch.status}</span>
                        </div>
                        {launch.post ? <blockquote>{launch.post}</blockquote> : null}
                        <div className="timeline-score">
                          <ScoreBar value={launch.score} line={onchain.minScore} />
                          <span className="mono">{launch.score}</span>
                        </div>
                        <p className="muted">{launch.reason}</p>
                        <div className="timeline-meta">
                          {launch.at ? <span>{timeAgo(launch.at)}</span> : null}
                          {launch.sample ? <span>Sample post</span> : null}
                          {launch.token ? (
                            <span className="mono">
                              {launch.status === "sent" ? "Token" : "Predicted"} {shortAddress(launch.token)}
                            </span>
                          ) : null}
                          {launch.status === "sent" ? (
                            <a href={`https://flap.sh/bnb/${launch.token}`} target="_blank" rel="noreferrer">
                              View on Flap ↗
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty title="No work yet">
                  {onchain.credit > 0n
                    ? "The agent has credit. The worker will take its next pass soon."
                    : "Burn $HELD so the agent can take its first pass."}
                </Empty>
              )}
            </>
          ) : null}

          {tab === "order" ? (
            <dl className="kv kv-wide">
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge active={onchain.active} />
                </dd>
              </div>
              <div>
                <dt>Watch list</dt>
                <dd>{record?.query || <span className="muted">Held by the worker</span>}</dd>
              </div>
              <div>
                <dt>Score line</dt>
                <dd className="score-dd">
                  <ScoreBar value={onchain.minScore} />
                  <span className="mono">{onchain.minScore}</span>
                </dd>
              </div>
              <div>
                <dt>Launches per day</dt>
                <dd className="mono">{onchain.maxLaunchesPerDay}</dd>
              </div>
              <div>
                <dt>Max first buy</dt>
                <dd className="mono">{formatEther(onchain.maxBuyWei)} BNB</dd>
              </div>
              <div>
                <dt>Watch list hash</dt>
                <dd>
                  <CopyText value={onchain.queryHash} short={shortAddress(onchain.queryHash)} />
                </dd>
              </div>
            </dl>
          ) : null}

          {tab === "contracts" ? (
            <dl className="kv kv-wide">
              <div>
                <dt>Agent meme</dt>
                <dd>
                  <CopyText value={onchain.meme} />
                </dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>
                  <CopyText value={onchain.owner} />
                </dd>
              </div>
              <div>
                <dt>Launch wallet</dt>
                <dd>
                  <CopyText value={onchain.launchWallet} />
                </dd>
              </div>
              <div>
                <dt>Image or note</dt>
                <dd className="break">{onchain.metaUri || <span className="muted">None</span>}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <aside className="agent-side">
          {isOwner ? (
            <>
              <form className="panel" onSubmit={burnForWork}>
                <div className="row-between">
                  <h3>Burn $HELD</h3>
                  <span className="muted small">
                    Balance <span className="mono">{balance === null ? "—" : formatToken(balance)}</span>
                  </span>
                </div>
                <p className="muted small">Burned $HELD becomes this agent's credit. A watch costs 1 and a launch costs 10.</p>
                <span className="input-suffix">
                  <input className="mono" inputMode="decimal" value={burn} onChange={(event) => setBurn(event.target.value)} />
                  <em>HELD</em>
                </span>
                <div className="chips">
                  {["11", "22", "55", "110"].map((value) => (
                    <button key={value} type="button" className="chip-btn" onClick={() => setBurn(value)}>
                      {value}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-block" disabled={busy} type="submit">
                  Burn for this agent
                </button>
              </form>

              <form className="panel" onSubmit={saveQuery}>
                <h3>Watch list</h3>
                <p className="muted small">Saving writes the order again, and runs the agent if it was paused.</p>
                <textarea value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="row">
                  <button className="btn btn-dark" disabled={busy} type="submit">
                    Save order
                  </button>
                  <button className="btn btn-ghost" disabled={busy || !onchain.active} type="button" onClick={pause}>
                    Pause agent
                  </button>
                </div>
              </form>

              <div className="panel panel-danger">
                <h3>Launch key</h3>
                <p className="muted small">
                  The private key of the agent wallet that launches on Flap. Anyone with it can move that wallet's BNB.
                </p>
                {exported ? (
                  <CopyText value={exported} short={`${exported.slice(0, 10)}…${exported.slice(-6)}`} />
                ) : (
                  <button className="btn btn-ghost" type="button" onClick={revealKey}>
                    Export launch key
                  </button>
                )}
              </div>

              {error ? <p className="notice notice-error">{error}</p> : null}
              {status ? <p className="notice notice-ok">{status}</p> : null}
            </>
          ) : (
            <div className="panel">
              <h3>Read only</h3>
              <p className="muted small">
                Burning, pausing, and the launch key belong to the wallet that created this agent,{" "}
                <span className="mono">{shortAddress(onchain.owner)}</span>.
              </p>
              {error ? <p className="notice notice-error">{error}</p> : null}
              <Link className="btn btn-primary btn-block" href="/desk/create">
                Create your own agent
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
