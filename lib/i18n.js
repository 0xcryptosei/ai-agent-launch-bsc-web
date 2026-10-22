"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { messages } from "./messages";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("society-lang");
    if (saved === "zh" || saved === "en") setLangState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.documentElement.classList.toggle("lang-zh", lang === "zh");
    document.title = messages[lang].title;
    window.localStorage.setItem("society-lang", lang);
  }, [lang, ready]);

  function setLang(next) {
    setLangState(next === "zh" ? "zh" : "en");
  }

  return <LanguageContext.Provider value={{ lang, setLang, t: messages[lang] }}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider missing");
  return value;
}
