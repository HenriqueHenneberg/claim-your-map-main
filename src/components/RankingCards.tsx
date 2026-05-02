import Link from "next/link";
import { formatPoints, initials } from "@/lib/format";
import type { RankingRow } from "@/types/domain";

export function TopThreePodium({ rows }: { rows: RankingRow[] }) {
  const top = rows.slice(0, 3);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {top.map((row) => (
        <Link
          key={row.user.id}
          href={`/user/${row.user.slug}`}
          className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-5 hover:border-amber-200/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-amber-200">#{row.position}</span>
            <span className="rounded-lg border border-amber-200/20 px-2 py-1 text-xs text-amber-100">{row.title}</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-sm font-black text-white">
              {initials(row.user.publicName)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-lg font-black text-white">{row.user.publicName}</div>
              <div className="truncate text-sm text-zinc-400">{row.location}</div>
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-emerald-300">{formatPoints(row.points)} pts</div>
        </Link>
      ))}
    </div>
  );
}

export function UserRankRow({ row }: { row: RankingRow }) {
  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:border-emerald-300/40 md:grid-cols-[64px_1fr_180px_160px] md:items-center">
      <div className="text-2xl font-black text-zinc-400">#{row.position}</div>
      <Link href={`/user/${row.user.slug}`} className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-black text-white">
          {initials(row.user.publicName)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold text-white">{row.user.publicName}</span>
          <span className="block truncate text-sm text-zinc-500">{row.user.message ?? row.location}</span>
        </span>
      </Link>
      <div>
        <div className="text-sm font-bold text-emerald-300">{formatPoints(row.points)} pontos</div>
        <div className="text-xs text-zinc-500">{row.title}</div>
      </div>
      <Link
        href="/checkout"
        className="inline-flex justify-center rounded-lg border border-emerald-300/30 px-3 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-300 hover:text-zinc-950"
      >
        {row.pointsToPass > 0 ? `Faltam ${formatPoints(row.pointsToPass)} pts` : "Ultrapassar"}
      </Link>
    </div>
  );
}

export function RankingCard({ rows }: { rows: RankingRow[] }) {
  const rest = rows.slice(3);
  return (
    <div className="space-y-4">
      <TopThreePodium rows={rows} />
      <div className="space-y-2">
        {rest.map((row) => <UserRankRow key={row.user.id} row={row} />)}
      </div>
      {!rows.length ? (
        <div className="rounded-lg border border-dashed border-white/10 p-10 text-center text-zinc-500">
          Nenhum ranking encontrado para esse filtro.
        </div>
      ) : null}
    </div>
  );
}
