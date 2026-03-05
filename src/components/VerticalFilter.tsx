import { Globe, Calculator, Shield, Layers } from "lucide-react";
import type { Vertical } from "@/lib/types";

const items: { id: Vertical; label: string; icon: typeof Globe; color: string }[] = [
  { id: "all", label: "Toutes", icon: Layers, color: "var(--color-muted)" },
  { id: "agence-web", label: "Agences Web", icon: Globe, color: "var(--color-vert-web)" },
  { id: "expert-comptable", label: "Comptables", icon: Calculator, color: "var(--color-vert-compta)" },
  { id: "assureur", label: "Assureurs", icon: Shield, color: "var(--color-vert-assur)" },
];

export default function VerticalFilter({
  selected,
  onChange,
}: {
  selected: Vertical;
  onChange: (v: Vertical) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const isActive = selected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all ${
              isActive
                ? "text-white shadow-sm"
                : "border border-border text-sub hover:border-raised hover:text-heading"
            }`}
            style={isActive ? { background: item.color } : undefined}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
