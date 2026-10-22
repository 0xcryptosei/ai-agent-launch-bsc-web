"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { decodeEventLog, keccak256, parseEther, stringToBytes } from "viem";
import { ConnectButton } from "../../../components/ConnectButton";
import { AgentAvatar, PageHead } from "../../../components/ui";
import { apiUrl, deskAbi, deskAddress } from "../../../lib/abi";
import { publicClient } from "../../../lib/chain";
import { shortAddress } from "../../../lib/format";
import { useSigner } from "../../../lib/useSigner";

const STEPS = [
  ["Save the watch list", "Worker"],
  ["Create the agent", "Held contract"],
  ["Set the launch wallet", "Held contract"],
  ["Write the order", "Held contract"],
  ["Register with the worker", "Worker"],
];

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    metaUri: "",
    query: "",
    minScore: "70",
    maxLaunches: "3",
    maxBuy: "0",
  });
  const [step, setStep] = useState(-1);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { address, client, isDemo } = useSigner();

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setFailed(false);
    setBusy(true);
    try {
      if (!deskAddress) throw new Error("The desk address is not configured. Deploy the contracts first.");
      if (!address) throw new Error("Connect a wallet on BSC.");
      const wallet = client();
      const name = form.name.trim();
      const symbol = form.symbol.trim().toUpperCase();
      const query = form.query.trim();
      if (!/^[A-Z0-9]{2,8}$/.test(symbol)) throw new Error("Use 2 to 8 letters or numbers for the symbol.");

      setStep(0);
      const prepared = await fetch(`${apiUrl}/api/agents/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body;
      });

      setStep(1);
      const createHash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "createAgent",
        args: [name, symbol, form.metaUri.trim()],
      });
      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
      const created = createReceipt.logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: deskAbi, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        })
        .find((log) => log && log.eventName === "AgentCreated");
      if (!created) throw new Error("The desk did not return the new agent.");
      const agentId = created.args.agentId;

      setStep(2);
      const walletHash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "setLaunchWallet",
        args: [agentId, prepared.launchWallet],
      });
      await publicClient.waitForTransactionReceipt({ hash: walletHash });

      setStep(3);
      const queryHash = keccak256(stringToBytes(query));
      const orderHash = await wallet.writeContract({
        address: deskAddress,
        abi: deskAbi,
        functionName: "setOrder",
        args: [agentId, Number(form.minScore), Number(form.maxLaunches), parseEther(form.maxBuy || "0"), queryHash],
      });
      await publicClient.waitForTransactionReceipt({ hash: orderHash });

      setStep(4);
      const registered = await fetch(`${apiUrl}/api/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agentId.toString(), owner: address, exportToken: prepared.exportToken }),
      }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body;
      });
      window.localStorage.setItem(`held-export-${registered.agentId}`, prepared.exportToken);
      setStep(5);
      router.push(`/desk/agents/${registered.agentId}`);
    } catch (err) {
      setError(err.shortMessage || err.message || "The transaction failed.");
      setFailed(true);
      setBusy(false);
    }
  }

  const symbol = form.symbol.trim().toUpperCase();
  const score = Number(form.minScore) || 0;

  return (
    <>
      <PageHead eyebrow="Create" title="Create an agent">
        This calls the Held contract. It deploys the agent's meme to your wallet and stores its order. It does not
        launch a token on Flap.
      </PageHead>

      <div className="create-layout">
        <form className="create-form" onSubmit={onSubmit}>
          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">1</span>
              <div>
                <h2>Identity</h2>
                <p>The name and symbol of the agent's meme on Held.</p>
              </div>
            </div>
            <div className="form-two">
              <label className="field">
                <span>Name</span>
                <input
                  value={form.name}
                  maxLength={32}
                  required
                  placeholder="Orange Cat"
                  onChange={(event) => set("name", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Symbol</span>
                <input
                  className="mono"
                  value={form.symbol}
                  maxLength={8}
                  required
                  placeholder="OCAT"
                  onChange={(event) => set("symbol", event.target.value.toUpperCase())}
                />
                <small>2 to 8 letters or numbers.</small>
              </label>
            </div>
            <label className="field">
              <span>Image or note URL</span>
              <input
                value={form.metaUri}
                placeholder="https:// or ipfs://"
                onChange={(event) => set("metaUri", event.target.value)}
              />
              <small>Optional. Up to 200 characters.</small>
            </label>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">2</span>
              <div>
                <h2>Order</h2>
                <p>The rules the agent follows on every pass.</p>
              </div>
            </div>
            <label className="field">
              <span>Watch on X</span>
              <textarea
                required
                value={form.query}
                placeholder="orange cat, or the accounts and keywords to follow"
                onChange={(event) => set("query", event.target.value)}
              />
              <small>Public posts only. The text stays with the worker, and its hash is stored on chain.</small>
            </label>
            <label className="field">
              <span className="row-between">
                Score line
                <strong className="mono">{score} / 100</strong>
              </span>
              <input
                className="range"
                type="range"
                min="0"
                max="100"
                value={form.minScore}
                style={{ "--value": `${score}%` }}
                onChange={(event) => set("minScore", event.target.value)}
              />
              <small>The agent launches only when a post scores at or above this line.</small>
            </label>
            <div className="form-two">
              <label className="field">
                <span>Launches per day</span>
                <input
                  className="mono"
                  type="number"
                  min="1"
                  max="24"
                  value={form.maxLaunches}
                  onChange={(event) => set("maxLaunches", event.target.value)}
                />
                <small>From 1 to 24.</small>
              </label>
              <label className="field">
                <span>Max first buy</span>
                <span className="input-suffix">
                  <input
                    className="mono"
                    inputMode="decimal"
                    value={form.maxBuy}
                    onChange={(event) => set("maxBuy", event.target.value)}
                  />
                  <em>BNB</em>
                </span>
                <small>0 means no first buy.</small>
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">3</span>
              <div>
                <h2>Create on Held</h2>
                <p>Your wallet signs three transactions on the Held contract.</p>
              </div>
            </div>
            {error ? <p className="notice notice-error">{error}</p> : null}
            {address ? (
              <button className="btn btn-primary btn-lg btn-block" disabled={busy} type="submit">
                {busy ? "Creating…" : "Create agent on Held"}
              </button>
            ) : (
              <ConnectButton className="btn btn-primary btn-lg btn-block" />
            )}
          </section>
        </form>

        <aside className="create-side">
          <div className="panel preview">
            <p className="side-label">Preview</p>
            <div className="preview-head">
              <AgentAvatar symbol={symbol || "??"} size="lg" />
              <div>
                <strong>{form.name || "Agent name"}</strong>
                <span className="mono muted">${symbol || "SYMBOL"}</span>
              </div>
            </div>
            <dl className="kv">
              <div>
                <dt>Score line</dt>
                <dd className="mono">{score}</dd>
              </div>
              <div>
                <dt>Launches per day</dt>
                <dd className="mono">{form.maxLaunches || "—"}</dd>
              </div>
              <div>
                <dt>Max first buy</dt>
                <dd className="mono">{form.maxBuy || "0"} BNB</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd className="mono">{address ? `${shortAddress(address)}${isDemo ? " · demo" : ""}` : "Not connected"}</dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <p className="side-label">What happens</p>
            <ol className="progress">
              {STEPS.map(([label, where], index) => {
                const state = step > index ? "done" : step === index ? (failed ? "failed" : "active") : "todo";
                return (
                  <li key={label} className={`progress-${state}`}>
                    <span className="progress-dot" />
                    <span>
                      <strong>{label}</strong>
                      <small>{where}</small>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="side-note">
              Next, burn $HELD on the agent page so it can work. A watch costs 1 $HELD and a launch costs 10.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
