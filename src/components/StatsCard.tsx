import type { LucideIcon } from "lucide-react";

export function StatsCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="metric-label">{label}</div>
          <div className="mt-2 text-2xl font-black text-white">{value}</div>
          {detail ? <div className="mt-1 text-xs text-zinc-500">{detail}</div> : null}
        </div>
        <Icon className="size-5 text-emerald-300" />
      </div>
    </div>
  );
}
