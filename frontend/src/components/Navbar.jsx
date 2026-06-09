import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Paste", to: "/paste" },
  { label: "Transfer", to: "/transfer" },
];

function Navbar({ showHomeLink = false }) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg)_72%,transparent)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-2 py-1 transition-all duration-200 hover:border-[color:var(--color-border)] hover:bg-[color:color-mix(in_srgb,var(--color-surface)_80%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
          aria-label="Go to Pastly home"
        >
          <BrandLogo className="h-10 w-auto sm:h-12" alt="Pastly home" />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={[
                  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]",
                  isActive(link.to)
                    ? "bg-[image:var(--gradient-brand)] text-white shadow-[0_8px_24px_-10px_var(--color-shadow)]"
                    : "border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_85%,transparent)] text-[color:var(--color-text)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]",
                ].join(" ")}
                aria-current={isActive(link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
