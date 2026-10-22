"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { CopyText } from "../../components/ui";
import { FLAP_PORTAL_ADDRESS, deskAddress, heldAddress } from "../../lib/abi";
import { useI18n } from "../../lib/i18n";

const addresses = { held: heldAddress, desk: deskAddress, portal: FLAP_PORTAL_ADDRESS };

export default function DocsPage() {
  const { t } = useI18n();
  const sections = t.docs.sections;
  const [current, setCurrent] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    sections.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="site">
      <SiteHeader active="docs" />

      <main className="container docs">
        <aside className="docs-toc">
          <p className="footer-label">{t.docs.toc}</p>
          <nav aria-label={t.docs.toc}>
            {sections.map(({ id, title }) => (
              <a key={id} href={`#${id}`} className={current === id ? "active" : undefined}>
                {title}
              </a>
            ))}
          </nav>
          <Link className="btn btn-dark btn-block" href="/desk/create">
            {t.docs.start}
          </Link>
        </aside>

        <article className="docs-body">
          <header className="docs-head">
            <h1>{t.docs.title}</h1>
            <p>{t.docs.lede}</p>
          </header>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="docs-section">
              <h2>{section.title}</h2>
              {section.paras?.map((para) => (
                <p key={para}>{para}</p>
              ))}
              {section.steps && (
                <ol className="docs-steps">
                  {section.steps.map(([title, copy]) => (
                    <li key={title}>
                      <strong>{title}</strong>
                      <span>{copy}</span>
                    </li>
                  ))}
                </ol>
              )}
              {section.rows && (
                <dl className="docs-table">
                  {section.rows.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {section.contracts && (
                <dl className="docs-table">
                  {section.contracts.map(([label, key]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{addresses[key] ? <CopyText value={addresses[key]} /> : <span className="muted">{t.docs.notSet}</span>}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {section.list && (
                <ul className="checks">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.note && <p className="docs-note">{section.note}</p>}
            </section>
          ))}

          <p className="docs-foot muted small">{t.docs.updated}</p>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
