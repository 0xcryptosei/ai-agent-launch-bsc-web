"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n";
import { bscscanUrl, flapUrl, telegramUrl, xUrl } from "../lib/links";
import { BscScanIcon, FlapIcon, TelegramIcon, XIcon } from "./BrandIcons";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  const { t } = useI18n();
  const footerLinks = [
    ["X", xUrl, XIcon],
    ["Telegram", telegramUrl, TelegramIcon],
    [t.footer.bscscan, bscscanUrl, BscScanIcon],
    [t.footer.flap, flapUrl, FlapIcon],
  ];

  return (
    <footer className="container site-footer">
      <div className="footer-panel">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <BrandMark />
            <strong>Society</strong>
          </Link>
          <p className="footer-tagline">
            {t.hero.line1}
            <br />
            {t.hero.line2}
          </p>
        </div>
        <nav className="footer-menu" aria-label={t.footer.nav}>
          <p className="footer-label">{t.footer.menu}</p>
          <a href="/#about">{t.nav.about}</a>
          <a href="/#feature">{t.nav.feature}</a>
          <a href="/#faq">{t.nav.faq}</a>
          <Link href="/docs">{t.nav.docs}</Link>
          <Link href="/desk">{t.launchApp}</Link>
        </nav>
        <div className="footer-social">
          <p className="footer-label">{t.footer.social}</p>
          <nav className="footer-links" aria-label={t.footer.links}>
            {footerLinks.map(([label, href, Icon]) =>
              href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                  <Icon />
                </a>
              ) : (
                <span key={label} aria-label={`${label} ${t.footer.unset}`} title={label}>
                  <Icon />
                </span>
              )
            )}
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <small className="footer-copy">{t.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</small>
        <small className="footer-note">{t.footer.note}</small>
      </div>
    </footer>
  );
}
