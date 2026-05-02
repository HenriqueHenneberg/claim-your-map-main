import { Coins } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { TerritorySummary } from "@/types/domain";

export function CheapToConquerCard({
  items,
}: {
  items: Array<{ territory: TerritorySummary; gap: { amountCents: number; points: number } }>;
}) {
  return (
    <section className="soft-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="size-4 text-emerald-300" />
        <h3 className="font-bold text-white">Mais barato para dominar agora</h3>
      </div>
      <div className="space-y-2">
        {items.map(({ territory, gap }) => (
          <Link
            key={territory.id}
            href={`/checkout?territory=${territory.slug}`}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-emerald-300/50"
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-100">{territory.name}</span>
              <span className="text-xs text-zinc-500">Esse território está barato para conquistar.</span>
            </span>
            <span className="text-sm font-black text-emerald-300">{formatCurrency(gap.amountCents)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
