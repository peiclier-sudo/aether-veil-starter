import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Globe,
  Calculator,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Logo from "./Logo";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

const verticalItems = [
  { to: "/agences-web", label: "Agences Web", icon: Globe, color: "var(--color-vert-web)" },
  { to: "/comptables", label: "Comptables", icon: Calculator, color: "var(--color-vert-compta)" },
  { to: "/assureurs", label: "Assureurs", icon: Shield, color: "var(--color-vert-assur)" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [verticalOpen, setVerticalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVerticalOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Verticals dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setVerticalOpen(!verticalOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[14px] font-medium transition-all ${
                verticalItems.some((v) => location.pathname === v.to)
                  ? "bg-accent/[0.06] text-accent"
                  : "text-sub hover:text-heading hover:bg-surface/60"
              }`}
            >
              Solutions
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${verticalOpen ? "rotate-180" : ""}`} />
            </button>
            {verticalOpen && (
              <div className="anim-fade-in absolute left-0 top-full mt-2 w-56 rounded-2xl border border-border bg-white p-2 shadow-lg shadow-black/[0.08]">
                {verticalItems.map((v) => {
                  const active = location.pathname === v.to;
                  return (
                    <Link
                      key={v.to}
                      to={v.to}
                      onClick={() => setVerticalOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        active ? "bg-accent/[0.06] text-accent" : "text-sub hover:text-heading hover:bg-surface/60"
                      }`}
                    >
                      <v.icon className="h-4 w-4" style={{ color: v.color }} />
                      {v.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium transition-all ${
                  active
                    ? "bg-accent/[0.06] text-accent"
                    : "text-sub hover:text-heading hover:bg-surface/60"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/dashboard" className="text-[14px] font-medium text-sub transition-colors hover:text-heading">
            Se connecter
          </Link>
          <Link
            to="/dashboard"
            className="btn-primary px-5 py-2.5 text-[14px]"
          >
            Essai gratuit
          </Link>
        </div>

        {/* Mobile */}
        <button
          className="rounded-xl p-2 text-sub transition-colors hover:text-heading hover:bg-surface md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="anim-fade-in border-t border-border bg-white/95 backdrop-blur-xl px-4 py-4 md:hidden">
          <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Solutions</p>
          {verticalItems.map((v) => {
            const active = location.pathname === v.to;
            return (
              <Link
                key={v.to}
                to={v.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                  active ? "text-accent bg-accent/[0.06]" : "text-sub hover:text-heading hover:bg-surface"
                }`}
              >
                <v.icon className="h-4 w-4" style={{ color: v.color }} />
                {v.label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-border" />
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                  active ? "text-accent bg-accent/[0.06]" : "text-sub hover:text-heading hover:bg-surface"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-3 border-t border-border pt-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="btn-primary block py-3 text-center text-[15px]"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
