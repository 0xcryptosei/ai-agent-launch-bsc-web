"use client";

import { useState } from "react";
import { shortAddress } from "../lib/format";
import { useI18n } from "../lib/i18n";
import { useSigner } from "../lib/useSigner";

export function ConnectButton({ className = "btn btn-dark" }) {
  const { t } = useI18n();
  const { address, connected, connect } = useSigner();
  const [error, setError] = useState("");

  return (
    <span className="connect">
      <button
        type="button"
        className={className}
        onClick={() => {
          setError("");
          connect().catch((err) => setError(err.shortMessage || err.message));
        }}
      >
        {connected ? (
          <>
            <i className="dot-on" />
            {shortAddress(address)}
          </>
        ) : (
          t.connect
        )}
      </button>
      {error ? <span className="connect-error">{error}</span> : null}
    </span>
  );
}
