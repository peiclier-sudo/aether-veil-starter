import { getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function scoreGradient(score: number): [string, string] {
  if (score >= 75) return ["#10b981", "#059669"];
  if (score >= 50) return ["#f59e0b", "#d97706"];
  return ["#ef4444", "#dc2626"];
}

const sizes = {
  sm: { box: 40, stroke: 3, radius: 16, font: "text-xs" },
  md: { box: 56, stroke: 3.5, radius: 22, font: "text-sm" },
  lg: { box: 88, stroke: 4, radius: 36, font: "text-2xl" },
};

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.radius;
  const offset = circumference - (score / 100) * circumference;
  const [color1, color2] = scoreGradient(score);
  const gradientId = `score-${size}-${score}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s.box, height: s.box }}>
        <svg
          viewBox={`0 0 ${s.box} ${s.box}`}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={s.box / 2}
            cy={s.box / 2}
            r={s.radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={s.stroke}
          />
          {/* Progress */}
          <circle
            cx={s.box / 2}
            cy={s.box / 2}
            r={s.radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-extrabold ${s.font}`}
          style={{ color: color2 }}
        >
          {score}
        </span>
      </div>
      {size !== "sm" && (
        <span
          className="text-xs font-semibold"
          style={{ color: color2 }}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
