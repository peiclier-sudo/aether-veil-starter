import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({ label, value, change, icon, color }: StatsCardProps) {
  return (
    <div className="card group overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-heading">
            {value}
          </p>
          {change && (
            <p className="mt-1 text-[12px] font-semibold text-accent">
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg opacity-40 transition-opacity group-hover:opacity-80"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
