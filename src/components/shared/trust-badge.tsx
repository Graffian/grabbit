import { getTrustBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  score: number;
  className?: string;
}

export function TrustBadge({ score, className }: TrustBadgeProps) {
  const { label, color } = getTrustBadge(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
        color,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
      {label} ({score})
    </span>
  );
}
