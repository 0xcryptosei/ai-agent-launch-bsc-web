"use client";

import { useState } from "react";

function hueOf(text) {
  let total = 0;
  for (const char of text ?? "") total = (total * 31 + char.charCodeAt(0)) % 360;
  return total;
}

export function AgentAvatar({ symbol, size = "md" }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ "--hue": hueOf(symbol) }} aria-hidden="true">
      {(symbol ?? "?").slice(0, 2)}
    </span>
  );
}

export function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? "badge-on" : "badge-off"}`}>
      <i />
      {active ? "Running" : "Paused"}
    </span>
  );
}

export function ScoreBar({ value, line }) {
  return (
    <span className="scorebar" aria-label={`Score ${value} of 100`}>
      <span className="scorebar-fill" style={{ width: `${Math.min(100, value)}%` }} />
      {line !== undefined ? <span className="scorebar-line" style={{ left: `${Math.min(100, line)}%` }} /> : null}
    </span>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <div className="stat-tile">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  );
}

export function CopyText({ value, short }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="mono muted">—</span>;
  return (
    <button
      type="button"
      className="copy"
      title={value}
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      <span className="mono">{short ?? value}</span>
      <span className="copy-hint">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function PageHead({ eyebrow, title, children, actions }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p className="page-lede">{children}</p> : null}
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </header>
  );
}

export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-mark" />
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
