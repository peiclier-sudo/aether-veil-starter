import type { ReactNode } from "react";

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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="mt-1 text-sm font-medium text-accent-600">
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
