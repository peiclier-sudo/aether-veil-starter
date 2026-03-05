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
    <div className="card group overflow-hidden p-5 transition-all hover:shadow-md hover:shadow-black/[0.04]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-heading">
            {value}
          </p>
          {change && (
            <p className="mt-1 text-[13px] font-semibold text-accent">
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl opacity-25 transition-opacity group-hover:opacity-50"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
