import { Globe, Calculator, Shield, Layers } from "lucide-react";
import type { Vertical } from "@/lib/types";

interface VerticalFilterProps {
  selected: Vertical;
  onChange: (v: Vertical) => void;
}

const items: { id: Vertical; label: string; icon: typeof Globe }[] = [
  { id: "all", label: "Toutes", icon: Layers },
  { id: "agence-web", label: "Agences Web", icon: Globe },
  { id: "expert-comptable", label: "Experts-Comptables", icon: Calculator },
  { id: "assureur", label: "Assureurs", icon: Shield },
];

export default function VerticalFilter({
  selected,
  onChange,
}: VerticalFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            selected === item.id
              ? "bg-primary-600 text-white shadow-sm"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
