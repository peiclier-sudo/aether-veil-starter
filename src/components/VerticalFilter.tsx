import { Globe, Calculator, Shield, Layers } from "lucide-react";
import type { Vertical } from "@/lib/types";

interface VerticalFilterProps {
  selected: Vertical;
  onChange: (v: Vertical) => void;
}

const items: { id: Vertical; label: string; icon: typeof Globe; color: string }[] = [
  { id: "all", label: "Toutes", icon: Layers, color: "#6b7280" },
  { id: "agence-web", label: "Agences Web", icon: Globe, color: "#6366f1" },
  { id: "expert-comptable", label: "Experts-Comptables", icon: Calculator, color: "#10b981" },
  { id: "assureur", label: "Assureurs", icon: Shield, color: "#f59e0b" },
];

export default function VerticalFilter({ selected, onChange }: VerticalFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = selected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              isActive
                ? "text-white shadow-sm"
                : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-700"
            }`}
            style={
              isActive
                ? { backgroundColor: item.color, boxShadow: `0 4px 12px ${item.color}30` }
                : undefined
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
