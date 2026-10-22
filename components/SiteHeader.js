"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";
import { BrandMark } from "./BrandMark";
import { ConnectButton } from "./ConnectButton";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader({ active }) {
  const { t } = useI18n();
  return (
    <header className="site-header">
      <div className="container site-bar">
        <Link className="brand" href="/">
          <BrandMark />
          <strong>Society</strong>
        </Link>
        <nav className="site-nav" aria-label="Sections">
          <a href="/#home">{t.nav.home}</a>
          <a href="/#about">{t.nav.about}</a>
          <a href="/#feature">{t.nav.feature}</a>
          <a href="/#faq">{t.nav.faq}</a>
          <Link href="/docs" className={active === "docs" ? "active" : undefined}>
            {t.nav.docs}
          </Link>
        </nav>
        <div className="row">
          <LanguageToggle />
          <ConnectButton className="btn btn-ghost" />
          <Link className="btn btn-dark" href="/desk">
            {t.launchApp}
          </Link>
        </div>
      </div>
    </header>
  );
}
