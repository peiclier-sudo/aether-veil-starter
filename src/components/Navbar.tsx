import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", label: "Index", mono: "00" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mono: "01" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, mono: "02" },
  { to: "/settings", label: "Config", icon: Settings, mono: "03" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "border-b border-border-subtle bg-void/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-lime text-[11px] font-extrabold text-void">
            N
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-heading">
            NEWCO<span className="text-lime">INTEL</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${
                  active ? "text-lime" : "text-muted hover:text-heading"
                }`}
              >
                <span className="font-mono text-[10px] text-muted opacity-50 transition-opacity group-hover:opacity-100">
                  {item.mono}
                </span>
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-px bg-lime" />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="font-mono text-[10px] text-muted">
            v1.0
          </span>
          <Link
            to="/dashboard"
            className="bg-lime px-4 py-1.5 text-[13px] font-bold text-void transition-all hover:bg-lime-dim"
          >
            ESSAI GRATUIT
          </Link>
        </div>

        {/* Mobile */}
        <button
          className="text-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="anim-fade-in border-t border-border-subtle bg-slab px-4 py-4 md:hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-lime" : "text-sub hover:text-heading"
                }`}
              >
                <span className="font-mono text-[10px] text-muted">{item.mono}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block bg-lime py-2.5 text-center text-sm font-bold text-void"
          >
            ESSAI GRATUIT
          </Link>
        </div>
      )}
    </nav>
  );
}
