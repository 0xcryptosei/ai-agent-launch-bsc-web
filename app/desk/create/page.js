"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { decodeEventLog, keccak256, parseEther, stringToBytes } from "viem";
import { ConnectButton } from "../../../components/ConnectButton";
import { AgentAvatar, PageHead } from "../../../components/ui";
import { apiUrl, deskAbi, deskAddress } from "../../../lib/abi";
import { publicClient } from "../../../lib/chain";
import { shortAddress } from "../../../lib/format";
import { useI18n } from "../../../lib/i18n";
import { useSigner } from "../../../lib/useSigner";

export default function CreatePage() {
  const { t } = useI18n();
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
      if (!deskAddress) throw new Error(t.create.errDesk);
      if (!address) throw new Error(t.create.errWallet);
      const wallet = client();
      const name = form.name.trim();
      const symbol = form.symbol.trim().toUpperCase();
      const query = form.query.trim();
      if (!/^[A-Z0-9]{2,8}$/.test(symbol)) throw new Error(t.create.errSymbol);

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
      if (!created) throw new Error(t.create.errAgent);
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
      setError(err.shortMessage || err.message || t.create.errTx);
      setFailed(true);
      setBusy(false);
    }
  }

  const symbol = form.symbol.trim().toUpperCase();
  const score = Number(form.minScore) || 0;

  return (
    <>
      <PageHead eyebrow={t.create.eyebrow} title={t.create.title}>
        {t.create.lede}
      </PageHead>

      <div className="create-layout">
        <form className="create-form" onSubmit={onSubmit}>
          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">1</span>
              <div>
                <h2>{t.create.identity}</h2>
                <p>{t.create.identityCopy}</p>
              </div>
            </div>
            <div className="form-two">
              <label className="field">
                <span>{t.create.name}</span>
                <input
                  value={form.name}
                  maxLength={32}
                  required
                  placeholder="Orange Cat"
                  onChange={(event) => set("name", event.target.value)}
                />
              </label>
              <label className="field">
                <span>{t.create.symbol}</span>
                <input
                  className="mono"
                  value={form.symbol}
                  maxLength={8}
                  required
                  placeholder="OCAT"
                  onChange={(event) => set("symbol", event.target.value.toUpperCase())}
                />
                <small>{t.create.symbolHint}</small>
              </label>
            </div>
            <label className="field">
              <span>{t.create.image}</span>
              <input
                value={form.metaUri}
                placeholder="https:// or ipfs://"
                onChange={(event) => set("metaUri", event.target.value)}
              />
              <small>{t.create.imageHint}</small>
            </label>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">2</span>
              <div>
                <h2>{t.create.order}</h2>
                <p>{t.create.orderCopy}</p>
              </div>
            </div>
            <label className="field">
              <span>{t.create.watch}</span>
              <textarea
                required
                value={form.query}
                placeholder={t.create.watchPlaceholder}
                onChange={(event) => set("query", event.target.value)}
              />
              <small>{t.create.watchHint}</small>
            </label>
            <label className="field">
              <span className="row-between">
                {t.common.scoreLine}
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
              <small>{t.create.scoreHint}</small>
            </label>
            <div className="form-two">
              <label className="field">
                <span>{t.create.perDay}</span>
                <input
                  className="mono"
                  type="number"
                  min="1"
                  max="24"
                  value={form.maxLaunches}
                  onChange={(event) => set("maxLaunches", event.target.value)}
                />
                <small>{t.create.perDayHint}</small>
              </label>
              <label className="field">
                <span>{t.create.maxBuy}</span>
                <span className="input-suffix">
                  <input
                    className="mono"
                    inputMode="decimal"
                    value={form.maxBuy}
                    onChange={(event) => set("maxBuy", event.target.value)}
                  />
                  <em>BNB</em>
                </span>
                <small>{t.create.maxBuyHint}</small>
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-num mono">3</span>
              <div>
                <h2>{t.create.signTitle}</h2>
                <p>{t.create.signCopy}</p>
              </div>
            </div>
            {error ? <p className="notice notice-error">{error}</p> : null}
            {address ? (
              <button className="btn btn-primary btn-lg btn-block" disabled={busy} type="submit">
                {busy ? t.create.creating : t.create.submit}
              </button>
            ) : (
              <ConnectButton className="btn btn-primary btn-lg btn-block" />
            )}
          </section>
        </form>

        <aside className="create-side">
          <div className="panel preview">
            <p className="side-label">{t.create.preview}</p>
            <div className="preview-head">
              <AgentAvatar symbol={symbol || "??"} size="lg" />
              <div>
                <strong>{form.name || t.create.agentName}</strong>
                <span className="mono muted">${symbol || "SYMBOL"}</span>
              </div>
            </div>
            <dl className="kv">
              <div>
                <dt>{t.common.scoreLine}</dt>
                <dd className="mono">{score}</dd>
              </div>
              <div>
                <dt>{t.create.perDay}</dt>
                <dd className="mono">{form.maxLaunches || "—"}</dd>
              </div>
              <div>
                <dt>{t.create.maxBuy}</dt>
                <dd className="mono">{form.maxBuy || "0"} BNB</dd>
              </div>
              <div>
                <dt>{t.common.owner}</dt>
                <dd className="mono">{address ? `${shortAddress(address)}${isDemo ? ` · ${t.create.demo}` : ""}` : t.create.notConnected}</dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <p className="side-label">{t.create.happens}</p>
            <ol className="progress">
              {t.create.steps.map(([label, where], index) => {
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
              {t.create.next}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
