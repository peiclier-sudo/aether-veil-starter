import { getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

const dims = {
  sm: { box: 36, r: 14, sw: 2.5, font: "text-[11px]" },
  md: { box: 52, r: 20, sw: 3, font: "text-sm" },
  lg: { box: 80, r: 32, sw: 3.5, font: "text-xl" },
};

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const d = dims[size];
  const circ = 2 * Math.PI * d.r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: d.box, height: d.box }}>
        <svg
          viewBox={`0 0 ${d.box} ${d.box}`}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={d.box / 2}
            cy={d.box / 2}
            r={d.r}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth={d.sw}
          />
          <circle
            cx={d.box / 2}
            cy={d.box / 2}
            r={d.r}
            fill="none"
            stroke={color}
            strokeWidth={d.sw}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring-track"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold ${d.font}`}
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {size !== "sm" && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
