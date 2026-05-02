import { ArrowUpRight, Crown, Shield, Swords } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPoints, statusClass, statusLabel, territoryTypeLabel } from "@/lib/format";
import { takeoverGap, titleForTerritory } from "@/lib/territory-rules";
import type { TerritorySummary } from "@/types/domain";

export function TerritoryPanel({ territory }: { territory: TerritorySummary | null }) {
  if (!territory) {
    return (
      <aside className="panel rounded-lg p-5 text-sm text-zinc-400">
        Selecione um território no mapa para ver dono atual, top 5 e custo de tomada.
      </aside>
    );
  }

  const gap = takeoverGap(territory.topScores ?? []);
  const title = titleForTerritory(territory.type);

  return (
    <aside className="panel rounded-lg p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{territoryTypeLabel(territory.type)}</div>
          <h2 className="mt-1 text-2xl font-black text-white">{territory.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {[territory.city, territory.state, territory.country].filter(Boolean).join(", ") || "Ranking mundial"}
          </p>
        </div>
        <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${statusClass(territory.status)}`}>
          {statusLabel(territory.status)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="soft-card p-3">
          <div className="metric-label">Dono atual</div>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-white">
            <Crown className="size-4 text-amber-300" />
            {territory.owner?.publicName ?? "Sem dono"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">{territory.owner ? title : "Primeira contribuição assume"}</div>
        </div>
        <div className="soft-card p-3">
          <div className="metric-label">Pontos</div>
          <div className="mt-2 text-xl font-black text-emerald-300">{formatPoints(territory.totalPoints)}</div>
          <div className="text-xs text-zinc-500">{formatCurrency(territory.totalAmountCents)} arrecadados</div>
        </div>
      </div>

      <div className="my-4 rounded-lg border border-orange-400/20 bg-orange-400/10 p-4 text-sm text-orange-100">
        <div className="flex items-center gap-2 font-bold">
          <Swords className="size-4" />
          Faltam só {formatPoints(gap.points)} pontos para tomar {territory.name}.
        </div>
        <div className="mt-1 text-orange-200/80">Você está a {formatCurrency(gap.amountCents)} de virar {title}.</div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <Shield className="size-4 text-emerald-300" />
          Top 5 local
        </div>
        <div className="space-y-2">
          {(territory.topScores ?? []).slice(0, 5).map((score, index) => (
            <Link
              key={score.userId}
              href={`/user/${score.user.slug}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-emerald-300/40"
            >
              <span className="text-sm text-zinc-200">#{index + 1} {score.user.publicName}</span>
              <span className="text-sm font-bold text-emerald-300">{formatPoints(score.points)}</span>
            </Link>
          ))}
          {!territory.topScores?.length ? <div className="text-sm text-zinc-500">Esse território está barato para conquistar.</div> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/checkout?territory=${territory.slug}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300"
        >
          Tomar este território <ArrowUpRight className="size-4" />
        </Link>
        <Link
          href={`/territory/${territory.slug}`}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-zinc-200 hover:border-amber-300/50"
        >
          Ver ranking completo
        </Link>
      </div>
    </aside>
  );
}
