import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({
  label,
  value,
  change,
  icon,
  color,
}: StatsCardProps) {
  return (
    <div className="surface-elevated group relative overflow-hidden rounded-2xl p-5">
      {/* Subtle gradient accent */}
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.06] transition-opacity group-hover:opacity-[0.1]"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
            {value}
          </p>
          {change && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
