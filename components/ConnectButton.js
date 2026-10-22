"use client";

import { useState } from "react";
import { shortAddress } from "../lib/format";
import { useSigner } from "../lib/useSigner";

export function ConnectButton({ className = "btn btn-dark" }) {
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
          "Connect wallet"
        )}
      </button>
      {error ? <span className="connect-error">{error}</span> : null}
    </span>
  );
}
