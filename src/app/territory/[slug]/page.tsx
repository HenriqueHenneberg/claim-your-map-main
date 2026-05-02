import { Crown, Swords } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BattleFeed } from "@/components/BattleFeed";
import { formatCurrency, formatPoints, statusClass, statusLabel, territoryTypeLabel } from "@/lib/format";
import { getTerritoryDetail } from "@/lib/queries";
import { titleForTerritory } from "@/lib/territory-rules";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TerritoryPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getTerritoryDetail(slug);
  if (!detail) notFound();

  const { territory, topScores, takeover, events, history, chart } = detail;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <section className="panel rounded-lg p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="metric-label">{territoryTypeLabel(territory.type)}</div>
            <h1 className="mt-2 text-4xl font-black text-white">{territory.name}</h1>
            <p className="mt-2 text-zinc-400">{[territory.city, territory.state, territory.country].filter(Boolean).join(", ") || "Ranking mundial"}</p>
          </div>
          <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${statusClass(territory.status)}`}>{statusLabel(territory.status)}</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="soft-card p-4">
            <div className="metric-label">Dono atual</div>
            <div className="mt-2 font-black text-white">{territory.owner?.publicName ?? "Sem dono"}</div>
            <div className="text-sm text-zinc-500">{territory.owner ? titleForTerritory(territory.type) : "Aberto"}</div>
          </div>
          <div className="soft-card p-4">
            <div className="metric-label">Pontos</div>
            <div className="mt-2 text-2xl font-black text-emerald-300">{formatPoints(territory.totalPoints)}</div>
          </div>
          <div className="soft-card p-4">
            <div className="metric-label">Valor total</div>
            <div className="mt-2 text-2xl font-black text-amber-200">{formatCurrency(territory.totalAmountCents)}</div>
          </div>
          <div className="soft-card p-4">
            <div className="metric-label">Para tomar</div>
            <div className="mt-2 text-2xl font-black text-orange-200">{formatCurrency(takeover.amountCents)}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-orange-400/20 bg-orange-400/10 p-4 text-orange-100">
          <Swords className="mr-2 inline size-4" />
          Faltam só {formatPoints(takeover.points)} pontos para tomar {territory.name}.
        </div>

        <Link href={`/checkout?territory=${territory.slug}`} className="mt-5 inline-flex rounded-lg bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300">
          Tomar este território
        </Link>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="soft-card p-5">
          <h2 className="mb-4 text-xl font-black text-white">Ranking local · Top 10</h2>
          <div className="space-y-2">
            {topScores.map((score, index) => (
              <Link key={score.user.id} href={`/user/${score.user.slug}`} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:border-emerald-300/40 md:grid-cols-[64px_1fr_160px_160px]">
                <span className="text-2xl font-black text-zinc-400">#{index + 1}</span>
                <span>
                  <span className="block font-bold text-white">{score.user.publicName}</span>
                  <span className="text-sm text-zinc-500">{index === 0 ? titleForTerritory(territory.type) : "Desafiante"}</span>
                </span>
                <span className="font-bold text-emerald-300">{formatPoints(score.points)} pts</span>
                <span className="text-zinc-400">{formatCurrency(score.amountCents)}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="soft-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white"><Crown className="size-5 text-amber-300" /> Evolução</h2>
            <div className="flex h-44 items-end gap-2">
              {chart.length ? chart.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-emerald-400/70" style={{ height: `${Math.max(8, (point.points / Math.max(...chart.map((item) => item.points))) * 150)}px` }} />
                  <span className="text-[10px] text-zinc-500">{point.label}</span>
                </div>
              )) : <p className="text-sm text-zinc-500">Sem pagamentos aprovados ainda.</p>}
            </div>
          </section>
          <BattleFeed events={events} />
        </div>
      </div>

      <section className="mt-6 soft-card p-5">
        <h2 className="mb-4 text-xl font-black text-white">Histórico de conquistas</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {history.map((event) => <p key={event.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">{event.text}</p>)}
          {!history.length ? <p className="text-zinc-500">Nenhuma conquista registrada ainda.</p> : null}
        </div>
      </section>
    </div>
  );
}
