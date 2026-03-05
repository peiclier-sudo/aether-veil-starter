import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Zap,
  Menu,
  X,
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
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = isLanding && !scrolled
    ? "bg-transparent border-transparent"
    : "glass border-gray-200/60 shadow-sm";

  const textColor = isLanding && !scrolled ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-900";
  const activeColor = isLanding && !scrolled ? "text-white bg-white/10" : "text-primary-700 bg-primary-50";
  const logoText = isLanding && !scrolled ? "text-white" : "text-gray-900";
  const accentText = isLanding && !scrolled ? "text-primary-300" : "text-primary-600";

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${navBg}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-extrabold text-white shadow-sm shadow-primary-500/25">
              N
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${logoText}`}>
              NewCo<span className={accentText}>Intel</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active ? activeColor : textColor
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
            <Link
              to="/dashboard"
              className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/30"
            >
              Essai gratuit
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`rounded-lg p-2 transition-colors md:hidden ${
              isLanding && !scrolled
                ? "text-white hover:bg-white/10"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-gray-200/60 bg-white px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-gray-100 pt-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
