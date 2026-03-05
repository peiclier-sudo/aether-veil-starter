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
    <div className="card group overflow-hidden rounded-none p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-heading">
            {value}
          </p>
          {change && (
            <p className="mt-1 font-mono text-[11px] font-medium text-lime">
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-none opacity-50 transition-opacity group-hover:opacity-100"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
