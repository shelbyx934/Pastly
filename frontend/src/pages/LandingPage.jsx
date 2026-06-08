import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";

const features = [
  {
    title: "Instant",
    description: "Create a paste or start a transfer in seconds with an interface that stays out of your way.",
  },
  {
    title: "No Signup",
    description: "Use everything immediately — no accounts, no onboarding, no friction of any kind.",
  },
  {
    title: "Simple Sharing",
    description: "Short links, transfer codes, and QR codes make it easy to share from any device.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 py-1 text-sm font-medium text-[color:var(--color-text-soft)] shadow-[0_16px_32px_-24px_var(--color-shadow)] animate-fade-in">
              Paste &amp; Transfer — live now
            </span>

            <div className="mt-8 rounded-[40px] bg-[image:var(--gradient-brand-soft)] p-[1px] shadow-[0_36px_80px_-44px_var(--color-shadow)] animate-fade-in-up">
              <div className="rounded-[calc(2.5rem-1px)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] px-6 py-8 sm:px-10 sm:py-10">
                <h1 className="sr-only">Pastly</h1>
                <BrandLogo
                  className="mx-auto h-auto w-full max-w-[320px] sm:max-w-[380px]"
                  alt="Pastly"
                />
                <p className="mx-auto mt-6 max-w-2xl text-xl font-medium tracking-tight text-[color:var(--color-text-strong)] sm:text-2xl">
                  Share text. Transfer files. Instantly.
                </p>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] sm:text-lg animate-fade-in">
              Simple, no-friction tools for sharing content and files — no account required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up">
              <Link
                to="/paste"
                id="hero-paste-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_48px_-26px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_54px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
              >
                Create Paste
              </Link>
              <Link
                to="/transfer"
                id="hero-transfer-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)] px-6 py-3 text-sm font-semibold text-[color:var(--color-text-strong)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
              >
                Transfer Files
              </Link>
            </div>
          </div>

          {/* Service cards */}
          <div className="mt-20 grid gap-6 lg:grid-cols-2">
            <ServiceCard
              title="Pastebin"
              description="Create and share text snippets, code, logs, and notes through short URLs."
              ctaLabel="Create Paste"
              to="/paste"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              }
            />
            <ServiceCard
              title="File Transfer"
              description="Upload any file up to 1 GB and share it via code, direct URL, or QR — expires in 10 minutes."
              ctaLabel="Transfer Files"
              to="/transfer"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              }
            />
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_72%,transparent)]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
              >
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
                  {f.title}
                </p>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
                  {f.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-soft)]">
                  {f.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[color:var(--color-text-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Pastly — share text and files without the friction.</p>
          <p>Paste · Transfer · No account needed</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
