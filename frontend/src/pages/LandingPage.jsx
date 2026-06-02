import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";

const features = [
  {
    title: "Fast",
    description:
      "Create a paste in seconds with an interface designed to stay out of the way.",
  },
  {
    title: "No Signup",
    description:
      "Use the core sharing flow immediately without accounts, onboarding, or friction.",
  },
  {
    title: "Simple Sharing",
    description:
      "Keep collaboration lightweight with short links that are easy to copy and send.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 py-1 text-sm font-medium text-[color:var(--color-text-soft)] shadow-[0_16px_32px_-24px_var(--color-shadow)]">
              Paste sharing is live
            </span>

            <div className="mt-8 rounded-[40px] bg-[image:var(--gradient-brand-soft)] p-[1px] shadow-[0_36px_80px_-44px_var(--color-shadow)]">
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

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] sm:text-lg">
              Simple tools for sharing content and files without unnecessary
              complexity.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/paste"
                className="inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-medium text-white shadow-[0_22px_48px_-26px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_54px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
              >
                Create Paste
              </Link>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-3 text-sm font-medium text-[color:var(--color-text-soft)] shadow-sm opacity-90"
              >
                Transfer Files
                <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-xs">
                  Coming Soon
                </span>
              </button>
            </div>
          </div>

          <div className="mt-20 grid gap-6 lg:grid-cols-2">
            <ServiceCard
              title="Pastebin"
              description="Create and share text snippets through short URLs."
              ctaLabel="Create Paste"
              to="/paste"
            />
            <ServiceCard
              title="Transfer Files"
              description="Transfer files using secure codes and QR sharing."
              ctaLabel="Coming Soon"
              disabled
              badge="Soon"
            />
          </div>
        </section>

        <section className="border-y border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_72%,transparent)]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.24)]"
              >
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
                  {feature.title}
                </p>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-soft)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[color:var(--color-text-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Pastly helps teams share text with less friction.</p>
          <p>Pastebin first. File transfer coming soon.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
