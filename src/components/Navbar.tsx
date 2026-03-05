import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", label: "Accueil", icon: Zap },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Paramètres", icon: Settings },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border-subtle bg-void/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[12px] font-extrabold text-void">
            N
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight text-heading">
            NewCo<span className="text-accent">Intel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-heading"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/dashboard"
            className="rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-void transition-all hover:bg-accent-dim"
          >
            Essai gratuit
          </Link>
        </div>

        {/* Mobile */}
        <button
          className="rounded-md p-1.5 text-muted transition-colors hover:text-heading md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="anim-fade-in border-t border-border-subtle bg-slab px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-accent" : "text-sub hover:text-heading"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-void"
          >
            Essai gratuit
          </Link>
        </div>
      )}
    </nav>
  );
}
