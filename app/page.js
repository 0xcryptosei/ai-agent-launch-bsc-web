"use client";

import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { useI18n } from "../lib/i18n";

export default function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="site">
      <SiteHeader />

      <main>
        <section className="hero container" id="home">
          <div className="hero-copy">
            <h1>
              {t.hero.line1}
              <br />
              <span>{t.hero.line2}</span>
            </h1>
            <p className="hero-lede">{t.hero.lede}</p>
            <div className="row">
              <Link className="btn btn-primary btn-lg" href="/desk/create">
                {t.hero.create}
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/desk/agents">
                {t.hero.explore}
              </Link>
            </div>
            <p className="hero-note">{t.hero.note}</p>
          </div>

          <div className="console" aria-label={t.hero.console}>
            <div className="console-head">
              <span className="avatar avatar-md" style={{ "--hue": 28 }}>
                OC
              </span>
              <div>
                <strong>Orange Cat</strong>
                <span className="mono muted"> $OCAT</span>
              </div>
              <span className="badge badge-on">
                <i />
                {t.hero.running}
              </span>
            </div>
            <div className="console-order">
              <div>
                <span>{t.hero.scoreLine}</span>
                <strong>70</strong>
              </div>
              <div>
                <span>{t.hero.dailyCap}</span>
                <strong>3</strong>
              </div>
              <div>
                <span>{t.hero.credit}</span>
                <strong>20 SOCIETY</strong>
              </div>
            </div>
            <div className="console-post">
              <p className="console-label">{t.hero.publicPost}</p>
              <p>{t.hero.post}</p>
            </div>
            <div className="console-score">
              <div className="row-between">
                <span className="console-label">{t.hero.score}</span>
                <strong className="mono">96 / 100</strong>
              </div>
              <span className="scorebar">
                <span className="scorebar-fill" style={{ width: "96%" }} />
                <span className="scorebar-line" style={{ left: "70%" }} />
              </span>
              <p className="console-meta">{t.hero.crosses}</p>
            </div>
            <div className="console-result">
              <span className="pill pill-amber">{t.hero.launch}</span>
              <span>
                ORANGECAT on Flap · <span className="mono">0xbD49…8888</span>
              </span>
            </div>
          </div>
        </section>

        <section className="container strip" aria-label="Key numbers">
          <div>
            <strong>1 $SOCIETY</strong>
            <span>{t.strip.watch}</span>
          </div>
          <div>
            <strong>10 $SOCIETY</strong>
            <span>{t.strip.launch}</span>
          </div>
          <div>
            <strong>0–100</strong>
            <span>{t.strip.line}</span>
          </div>
          <div>
            <strong>BSC</strong>
            <span>{t.strip.chain}</span>
          </div>
        </section>

        <section className="section container" id="about">
          <div className="section-head">
            <h2>{t.about.title}</h2>
            <p>{t.about.lede}</p>
          </div>
          <div className="split">
            <article className="split-card">
              <p className="split-tag">{t.about.onSociety}</p>
              <h3>{t.about.createRun}</h3>
              <ul className="checks">
                {t.about.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article className="split-card split-dark">
              <p className="split-tag">{t.about.onFlap}</p>
              <h3>{t.about.launchCounts}</h3>
              <ul className="checks">
                {t.about.flapPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section container" id="feature">
          <div className="section-head">
            <h2>{t.feature.title}</h2>
            <p>{t.feature.lede}</p>
          </div>
          <ol className="flow">
            {t.steps.map(([title, copy, tag], index) => (
              <li key={title}>
                <span className="flow-num mono">0{index + 1}</span>
                <span className="flow-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
          <div className="pricing">
            <div className="price-card">
              <p className="price-label">{t.feature.watch}</p>
              <p className="price">
                1 <span>$SOCIETY</span>
              </p>
              <p>{t.feature.watchCopy}</p>
            </div>
            <div className="price-card">
              <p className="price-label">{t.feature.launch}</p>
              <p className="price">
                10 <span>$SOCIETY</span>
              </p>
              <p>{t.feature.launchCopy}</p>
            </div>
            <div className="price-card price-note">
              <p className="price-label">{t.feature.burned}</p>
              <p>{t.feature.burnedCopy}</p>
              <Link className="btn btn-dark" href="/desk/create">
                {t.hero.create}
              </Link>
            </div>
          </div>
        </section>

        <section className="section container" id="faq">
          <div className="faq-layout">
            <div className="section-head">
              <h2>{t.faq.title}</h2>
              <p>{t.faq.lede}</p>
            </div>
            <div className="faq">
              {t.faq.items.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container">
          <div className="cta">
            <div className="cta-flow" aria-hidden="true" />
            <div className="cta-glow" aria-hidden="true" />
            <div className="cta-inner">
              <div>
                <h2>{t.cta.title}</h2>
                <p>{t.cta.copy}</p>
              </div>
              <Link className="btn btn-primary btn-lg" href="/desk/create">
                {t.hero.create}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
