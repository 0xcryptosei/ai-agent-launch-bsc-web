"use client";

import { useI18n } from "../lib/i18n";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t.language}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <button type="button" lang="zh" aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>
        中文
      </button>
    </div>
  );
}
