"use client";

import { useEffect, useId, useRef, useState } from "react";
import { shortAddress } from "../lib/format";
import { useI18n } from "../lib/i18n";
import { useSigner } from "../lib/useSigner";

export function ConnectButton({ className = "btn btn-dark" }) {
  const { t } = useI18n();
  const { address, connected, connect, disconnect } = useSigner();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span className="connect" ref={rootRef}>
      {connected ? (
        <span className="connect-menu">
          <button
            type="button"
            className={`${className} connect-trigger${open ? " connect-trigger-open" : ""}`}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <i className="dot-on" />
            {shortAddress(address)}
            <span className="connect-chevron" aria-hidden="true" />
          </button>
          {open ? (
            <div className="connect-dropdown" id={menuId} role="menu">
              <button
                type="button"
                role="menuitem"
                className="connect-dropdown-item"
                onClick={() => {
                  setError("");
                  setOpen(false);
                  disconnect();
                }}
              >
                {t.disconnect}
              </button>
            </div>
          ) : null}
        </span>
      ) : (
        <button
          type="button"
          className={className}
          onClick={() => {
            setError("");
            connect().catch((err) => setError(err.shortMessage || err.message));
          }}
        >
          {t.connect}
        </button>
      )}
      {error ? <span className="connect-error">{error}</span> : null}
    </span>
  );
}
