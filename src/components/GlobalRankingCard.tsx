import { Trophy } from "lucide-react";
import Link from "next/link";
import { formatPoints, initials } from "@/lib/format";
import type { RankingRow } from "@/types/domain";

export function GlobalRankingCard({ rows }: { rows: RankingRow[] }) {
  return (
    <section className="soft-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="size-4 text-amber-300" />
        <h3 className="font-bold text-white">Ranking global</h3>
      </div>
      <div className="space-y-2">
        {rows.slice(0, 5).map((row) => (
          <Link
            key={row.user.id}
            href={`/user/${row.user.slug}`}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2 hover:border-amber-300/40"
          >
            <span className="w-6 text-center text-sm font-black text-amber-200">#{row.position}</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-black text-zinc-100">
              {initials(row.user.publicName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{row.user.publicName}</span>
              <span className="text-xs text-zinc-500">{row.title}</span>
            </span>
            <span className="text-sm font-bold text-emerald-300">{formatPoints(row.points)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
