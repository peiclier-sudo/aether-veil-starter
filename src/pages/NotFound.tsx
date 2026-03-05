import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page introuvable — NewCo Intel";
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center px-4 text-center">
      <div className="anim-fade-up">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/[0.06]">
          <Search className="h-8 w-8 text-accent" />
        </div>

        <p className="font-mono text-[13px] font-semibold uppercase tracking-widest text-accent">
          Erreur 404
        </p>

        <h1 className="mt-3 font-display text-[2.5rem] leading-tight text-heading sm:text-[3.5rem]">
          Page introuvable.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-sub">
          Cette page n'existe pas ou a été déplacée. Pas de panique — vos leads vous attendent sur le dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="btn-primary group inline-flex items-center gap-2.5 px-7 py-3.5 text-[15px]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </Link>
          <Link
            to="/dashboard"
            className="rounded-xl border border-border px-6 py-3.5 text-[15px] font-medium text-sub transition-all hover:border-heading hover:text-heading hover:shadow-sm"
          >
            Voir le dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
