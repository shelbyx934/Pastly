import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";

/* ── Slide data ──────────────────────────────────────────────────── */
const slides = [
  {
    id: "paste",
    badge: "Pastebin",
    headline: "Share Text Instantly",
    sub: "Paste code, notes, or logs — get a short link in seconds. No fluff, no sign-up.",
    cta: { label: "Create a Paste", to: "/paste" },
    accentColor: "#7c6fff",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
        <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <rect x="16" y="2" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <line x1="16" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="27" x2="32" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="34" x2="26" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "noaccount",
    badge: "Zero friction",
    headline: "No Account. Ever.",
    sub: "Jump straight in — no registration, no email, no passwords. Your content is ready before your coffee gets cold.",
    cta: { label: "Try it now", to: "/paste" },
    accentColor: "#22d3ee",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
        <rect x="10" y="22" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M16 22v-6a8 8 0 0 1 16 0v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="32" r="3" fill="currentColor" />
        <line x1="24" y1="35" x2="24" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "transfer",
    badge: "File Transfer",
    headline: "Transfer Files up to 1 GB",
    sub: "Upload a file, get a code. Receiver enters the code — download starts instantly. Expires in 10 minutes.",
    cta: { label: "Send a File", to: "/transfer/send" },
    accentColor: "#a29bfe",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
        <path d="M24 6v24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 16l10-10 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 34v4a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "share",
    badge: "Smart Sharing",
    headline: "Code · URL · QR Code",
    sub: "Every transfer gives you three ways to share — a short code, a direct link you can copy, and a scannable QR.",
    cta: { label: "Start Transferring", to: "/transfer" },
    accentColor: "#06d6a0",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
        <circle cx="38" cy="10" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="10" cy="24" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="38" cy="38" r="5" stroke="currentColor" strokeWidth="2.5" />
        <line x1="15" y1="21" x2="33" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="27" x2="33" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

/* ── HeroSlideshow ─────────────────────────────────────────────── */
function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [animClass, setAnimClass] = useState("slide-enter");
  const timerRef = useRef(null);
  const pausedRef = useRef(false);

  const goTo = (idx) => {
    if (idx === current) return;
    setAnimClass("slide-exit");
    setTimeout(() => {
      setCurrent(idx);
      setAnimClass("slide-enter");
    }, 250);
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setAnimClass("slide-exit");
        setTimeout(() => {
          setCurrent((c) => {
            const n = (c + 1) % slides.length;
            setAnimClass("slide-enter");
            return n;
          });
        }, 250);
      }
    }, 3800);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = slides[current];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Glow blobs behind the card */}
      <div
        className="glow-blob pointer-events-none"
        style={{
          width: 380,
          height: 280,
          top: "10%",
          left: "5%",
          background: `radial-gradient(ellipse, ${slide.accentColor}55, transparent 70%)`,
          transition: "background 0.8s ease",
        }}
      />
      <div
        className="glow-blob pointer-events-none"
        style={{
          width: 300,
          height: 220,
          bottom: "5%",
          right: "5%",
          background: `radial-gradient(ellipse, ${slide.accentColor}33, transparent 70%)`,
          animationDelay: "2s",
          transition: "background 0.8s ease",
        }}
      />

      {/* Slide card */}
      <div
        className="glass-card relative mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] px-8 py-14 text-center shadow-[0_40px_100px_-40px_var(--color-shadow)] sm:px-14 sm:py-20"
        style={{ borderColor: `${slide.accentColor}28` }}
      >
        {/* Badge */}
        <div className={animClass} style={{ animationDelay: "0ms" }}>
          <span
            className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{
              borderColor: `${slide.accentColor}44`,
              color: slide.accentColor,
              background: `${slide.accentColor}14`,
            }}
          >
            {slide.badge}
          </span>
        </div>

        {/* Icon */}
        <div className={`${animClass} mx-auto mt-8 flex items-center justify-center`} style={{ animationDelay: "40ms" }}>
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl animate-float"
            style={{
              color: slide.accentColor,
              background: `${slide.accentColor}16`,
              border: `1px solid ${slide.accentColor}30`,
              boxShadow: `0 0 40px ${slide.accentColor}28`,
            }}
          >
            {slide.icon}
          </div>
        </div>

        {/* Headline */}
        <h2
          className={`${animClass} mt-8 text-4xl font-extrabold tracking-tight text-[color:var(--color-text-strong)] sm:text-5xl`}
          style={{ animationDelay: "80ms" }}
        >
          {slide.headline}
        </h2>

        {/* Subtitle */}
        <p
          className={`${animClass} mx-auto mt-4 max-w-lg text-base leading-8 text-[color:var(--color-text-soft)] sm:text-lg`}
          style={{ animationDelay: "120ms" }}
        >
          {slide.sub}
        </p>

        {/* CTA */}
        <div className={`${animClass} mt-10`} style={{ animationDelay: "160ms" }}>
          <Link
            to={slide.cta.to}
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
            style={{
              background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}bb)`,
              boxShadow: `0 16px 40px -16px ${slide.accentColor}88`,
            }}
          >
            {slide.cta.label}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Decorative corner shimmer */}
        <div
          className="pointer-events-none absolute -top-px left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${slide.accentColor}66, transparent)` }}
        />
      </div>

      {/* Controls row */}
      <div className="mt-8 flex items-center justify-center gap-5">
        {/* Prev */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] text-[color:var(--color-text-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`slide-dot ${i === current ? "active" : ""}`}
              style={i === current ? { background: slide.accentColor } : {}}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] text-[color:var(--color-text-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── LandingPage ───────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
          {/* Page-level glow orbs */}
          <div className="glow-blob pointer-events-none -z-10" style={{ width: 600, height: 400, top: -80, left: "50%", transform: "translateX(-60%)", background: "radial-gradient(ellipse, rgba(124,111,255,0.11), transparent 65%)" }} />
          <div className="glow-blob pointer-events-none -z-10" style={{ width: 400, height: 300, top: 0, right: "8%", background: "radial-gradient(ellipse, rgba(34,211,238,0.07), transparent 65%)", animationDelay: "3s" }} />

          {/* Eyebrow */}
          <div className="mb-10 text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] animate-pulse-soft" />
              Paste &amp; Transfer — live now
            </span>
          </div>

          {/* Slideshow */}
          <div className="animate-fade-in-up">
            <h1 className="sr-only">Pastly — Share text and transfer files instantly</h1>
            <HeroSlideshow />
          </div>
        </section>

        {/* ── Service cards ────────────────────────────────── */}
        <section
          aria-labelledby="services-heading"
          className="border-t border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_55%,transparent)] py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2
                id="services-heading"
                className="text-3xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-4xl"
              >
                What would you like to do?
              </h2>
              <p className="mt-3 text-base text-[color:var(--color-text-soft)]">
                Two focused tools — pick one and get going.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ServiceCard
                title="Pastebin"
                description="Create and share text snippets, code, logs, and notes through short URLs. Syntax highlighting ready."
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
                description="Upload any file up to 1 GB and share it via code, direct URL, or QR code — expires in 10 minutes."
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
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-[color:var(--color-text-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Pastly — share text and files without the friction.</p>
          <p>Paste · Share · Transfer</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
