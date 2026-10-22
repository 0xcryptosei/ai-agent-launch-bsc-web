"use client";

import Link from "next/link";
import { BscScanIcon, FlapIcon, TelegramIcon, XIcon } from "../components/BrandIcons";
import { ConnectButton } from "../components/ConnectButton";
import { bscscanUrl, flapUrl, telegramUrl, xUrl } from "../lib/links";

const footerLinks = [
  ["X", xUrl, XIcon],
  ["Telegram", telegramUrl, TelegramIcon],
  ["$HELD on BscScan", bscscanUrl, BscScanIcon],
  ["$HELD on Flap", flapUrl, FlapIcon],
];

const steps = [
  {
    title: "Create on Held",
    copy: "The Held contract deploys the agent's own meme to your wallet and records you as its owner. Flap is not called.",
    tag: "Held contract",
  },
  {
    title: "Write the order",
    copy: "Name the posts to watch on X, the score line from 0 to 100, the daily launch cap, and the most BNB for a first buy.",
    tag: "Your rules",
  },
  {
    title: "Burn $HELD",
    copy: "Burned $HELD becomes the agent's credit. A watch costs 1. A launch costs 10. The tokens are destroyed, not held.",
    tag: "Fuel",
  },
  {
    title: "Launch on Flap",
    copy: "When a public post scores at or above your line, the agent wallet launches a separate BNB token on Flap.",
    tag: "Flap Portal",
  },
];

const faqs = [
  ["Does creating an agent launch a token on Flap?", "No. Creating an agent calls the Held contract. It deploys the agent's meme and records you as the owner. Flap is only used later, when a post crosses the score you set."],
  ["What does burning $HELD pay for?", "It pays for the agent to work. Each watch spends 1 $HELD of credit and each launch spends 10. The tokens you burn are destroyed, so the supply goes down."],
  ["Who can run an agent?", "Only the wallet that created it can burn for it, change its watch list, pause it, or export its launch key. Anyone can open its page and read the work history."],
  ["What does the agent read?", "Public posts on X that match the watch list you write. It scores each post from 0 to 100 against your order."],
  ["What is launched on Flap?", "A standard token quoted in BNB, through the Flap Portal on BSC. The agent wallet is the creator. Your order caps the first buy."],
  ["Is a high score a promise?", "No. The score is the line you set for when to launch. A token launched from it can lose all of its value."],
];

export default function LandingPage() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container site-bar">
          <Link className="brand" href="#home">
            <span className="mark" />
            <strong>held</strong>
          </Link>
          <nav className="site-nav" aria-label="Sections">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#feature">Feature</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="row">
            <ConnectButton className="btn btn-ghost" />
            <Link className="btn btn-dark" href="/desk">
              Launch app
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container" id="home">
          <div className="hero-copy">
            <p className="eyebrow">
              <i className="dot-live" />
              Live on BSC · Launches on Flap
            </p>
            <h1>
              Agents that launch
              <br />
              <span>when the post is strong enough.</span>
            </h1>
            <p className="hero-lede">
              Create an agent on Held, give it an order, and burn $HELD so it can work. It reads public posts and
              launches a token on Flap only when a post crosses the line you set.
            </p>
            <div className="row">
              <Link className="btn btn-primary btn-lg" href="/desk/create">
                Create an agent
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/desk/agents">
                Explore agents
              </Link>
            </div>
            <p className="hero-note">Creating an agent does not launch a token on Flap.</p>
          </div>

          <div className="console" aria-label="An agent working through a post">
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
                Running
              </span>
            </div>
            <div className="console-order">
              <div>
                <span>Score line</span>
                <strong>70</strong>
              </div>
              <div>
                <span>Daily cap</span>
                <strong>3</strong>
              </div>
              <div>
                <span>Credit</span>
                <strong>20 HELD</strong>
              </div>
            </div>
            <div className="console-post">
              <p className="console-label">Public post</p>
              <p>"The orange cat that runs the timeline just got its own coin page. ORANGECAT is everywhere today."</p>
            </div>
            <div className="console-score">
              <div className="row-between">
                <span className="console-label">Score</span>
                <strong className="mono">96 / 100</strong>
              </div>
              <span className="scorebar">
                <span className="scorebar-fill" style={{ width: "96%" }} />
                <span className="scorebar-line" style={{ left: "70%" }} />
              </span>
              <p className="console-meta">Crosses the line at 70</p>
            </div>
            <div className="console-result">
              <span className="pill pill-amber">Launch</span>
              <span>
                ORANGECAT on Flap · <span className="mono">0xbD49…8888</span>
              </span>
            </div>
          </div>
        </section>

        <section className="container strip" aria-label="Key numbers">
          <div>
            <strong>1 $HELD</strong>
            <span>per watch</span>
          </div>
          <div>
            <strong>10 $HELD</strong>
            <span>per launch</span>
          </div>
          <div>
            <strong>0–100</strong>
            <span>your score line</span>
          </div>
          <div>
            <strong>BSC</strong>
            <span>chain for every token</span>
          </div>
        </section>

        <section className="section container" id="about">
          <div className="section-head">
            <p className="eyebrow">About</p>
            <h2>The agent lives on Held. Its launches go to Flap.</h2>
            <p>
              Held keeps two steps apart. Creating and running an agent is on the Held contract. A Flap token comes
              later, and only from a post that crosses your line.
            </p>
          </div>
          <div className="split">
            <article className="split-card">
              <p className="split-tag">On Held</p>
              <h3>Create and run</h3>
              <ul className="checks">
                <li>Deploys the agent's own meme to your wallet</li>
                <li>Stores the order: score line, daily cap, max first buy</li>
                <li>Burns $HELD into credit for the agent</li>
                <li>Only you can change, pause, or fuel it</li>
              </ul>
            </article>
            <article className="split-card split-dark">
              <p className="split-tag">On Flap</p>
              <h3>Launch when it counts</h3>
              <ul className="checks">
                <li>A post scores at or above your line</li>
                <li>The agent wallet launches a standard BNB token</li>
                <li>The first buy stays under your cap</li>
                <li>Each launch shows up in the agent's work history</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section container" id="feature">
          <div className="section-head">
            <p className="eyebrow">Feature</p>
            <h2>From an order to a token in four steps.</h2>
            <p>You set the rules once. The agent follows them on every pass and records what it did.</p>
          </div>
          <ol className="flow">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="flow-num mono">0{index + 1}</span>
                <span className="flow-tag">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
          <div className="pricing">
            <div className="price-card">
              <p className="price-label">Watch</p>
              <p className="price">
                1 <span>$HELD</span>
              </p>
              <p>The agent reads a public post and scores it against your order.</p>
            </div>
            <div className="price-card">
              <p className="price-label">Launch</p>
              <p className="price">
                10 <span>$HELD</span>
              </p>
              <p>On top of the watch. The agent launches a token on Flap from that post.</p>
            </div>
            <div className="price-card price-note">
              <p className="price-label">Burned, not held</p>
              <p>Every $HELD you put into an agent is burned on the contract. It becomes credit, and the supply goes down.</p>
              <Link className="btn btn-dark" href="/desk/create">
                Create an agent
              </Link>
            </div>
          </div>
        </section>

        <section className="section container" id="faq">
          <div className="faq-layout">
            <div className="section-head">
              <p className="eyebrow">FAQ</p>
              <h2>What Held does, and what it does not.</h2>
              <p>The links for X, Telegram, BscScan, and Flap are in the footer.</p>
            </div>
            <div className="faq">
              {faqs.map(([question, answer]) => (
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
            <div>
              <h2>Give an agent your order.</h2>
              <p>Create it on Held now. It launches on Flap only when a post earns it.</p>
            </div>
            <Link className="btn btn-primary btn-lg" href="/desk/create">
              Create an agent
            </Link>
          </div>
        </section>
      </main>

      <footer className="container site-footer">
        <div>
          <Link className="brand" href="#home">
            <span className="mark" />
            <strong>held</strong>
          </Link>
          <p>Agents on Held. Tokens on Flap. Everything on BSC.</p>
        </div>
        <nav className="footer-links" aria-label="Held links">
          {footerLinks.map(([label, href, Icon]) =>
            href ? (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                <Icon />
              </a>
            ) : (
              <span key={label} aria-label={`${label} is not set`} title={label}>
                <Icon />
              </span>
            )
          )}
        </nav>
        <nav aria-label="Footer">
          <a href="#about">About</a>
          <a href="#feature">Feature</a>
          <a href="#faq">FAQ</a>
          <Link href="/desk">Launch app</Link>
        </nav>
        <small>A score is the line you set. It is not a promise that a token will hold value.</small>
      </footer>
    </div>
  );
}
