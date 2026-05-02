import Link from "next/link";
import { formatCurrency, formatPoints, territoryTypeLabel } from "@/lib/format";
import type { TerritorySummary } from "@/types/domain";

export function TerritoryHistory({
  items,
}: {
  items: Array<{ territory: TerritorySummary; points: number; amountCents: number }>;
}) {
  return (
    <section className="soft-card p-5">
      <h2 className="mb-4 text-xl font-black text-white">Histórico territorial</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            href={`/territory/${item.territory.slug}`}
            key={item.territory.id}
            className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:border-emerald-300/40 md:grid-cols-[1fr_140px_140px]"
          >
            <span>
              <span className="block font-bold text-white">{item.territory.name}</span>
              <span className="text-sm text-zinc-500">{territoryTypeLabel(item.territory.type)}</span>
            </span>
            <span className="font-bold text-emerald-300">{formatPoints(item.points)} pts</span>
            <span className="text-zinc-400">{formatCurrency(item.amountCents)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
