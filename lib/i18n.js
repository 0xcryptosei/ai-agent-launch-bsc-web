"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages } from "./messages";

const LanguageContext = createContext(null);
const STORAGE_KEY = "society-lang";

function readStoredLang() {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* private mode */
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(readStoredLang());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.documentElement.classList.toggle("lang-zh", lang === "zh");
    document.title = messages[lang].title;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode */
    }
  }, [lang, hydrated]);

  function setLang(next) {
    setLangState(next === "zh" ? "zh" : "en");
  }

  const value = useMemo(() => ({ lang, setLang, t: messages[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider missing");
  return value;
}
