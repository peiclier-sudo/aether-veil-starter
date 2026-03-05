import { Globe, Calculator, Shield, Layers } from "lucide-react";
import type { Vertical } from "@/lib/types";

const items: { id: Vertical; label: string; icon: typeof Globe; color: string }[] = [
  { id: "all", label: "TOUS", icon: Layers, color: "var(--color-muted)" },
  { id: "agence-web", label: "WEB", icon: Globe, color: "var(--color-vert-web)" },
  { id: "expert-comptable", label: "COMPTA", icon: Calculator, color: "var(--color-vert-compta)" },
  { id: "assureur", label: "ASSUR", icon: Shield, color: "var(--color-vert-assur)" },
];

export default function VerticalFilter({
  selected,
  onChange,
}: {
  selected: Vertical;
  onChange: (v: Vertical) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => {
        const isActive = selected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider transition-all ${
              isActive
                ? "text-void"
                : "border border-border text-muted hover:border-heading hover:text-heading"
            }`}
            style={isActive ? { background: item.color, color: "var(--color-void)" } : undefined}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
