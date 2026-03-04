import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-accent-500";
  if (score >= 50) return "text-warning-500";
  return "text-danger-500";
}

export function getScoreBg(score: number): string {
  if (score >= 75) return "bg-accent-500";
  if (score >= 50) return "bg-warning-500";
  return "bg-danger-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Bon";
  if (score >= 25) return "Moyen";
  return "Faible";
}

export function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return `Il y a ${diff} jours`;
}
