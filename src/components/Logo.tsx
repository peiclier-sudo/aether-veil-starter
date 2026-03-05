import { Link } from "react-router-dom";

export default function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "sm" ? "text-[14px]" : "text-[17px]";

  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className={`${dim} flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-accent shadow-md shadow-accent/20`}>
        <svg viewBox="0 0 32 32" className="h-[60%] w-[60%]">
          <path d="M6 25V7h3.5l8.5 12V7H21v18h-3.2L9.5 13V25z" fill="white" />
        </svg>
      </div>
      <span className={`${text} font-semibold tracking-tight text-heading`}>
        NewCo<span className="font-display italic text-accent">Intel</span>
      </span>
    </Link>
  );
}
