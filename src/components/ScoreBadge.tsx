import { getScoreColor, getScoreBg, getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]}`}
      >
        <svg className="absolute inset-0" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            className={getScoreBg(score).replace("bg-", "stroke-")}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      {size !== "sm" && (
        <span className={`text-xs font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
