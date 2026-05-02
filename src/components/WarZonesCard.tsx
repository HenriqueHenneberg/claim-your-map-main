import { Flame } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPoints } from "@/lib/format";
import { takeoverGap } from "@/lib/territory-rules";
import type { TerritorySummary } from "@/types/domain";

export function WarZonesCard({ territories }: { territories: TerritorySummary[] }) {
  return (
    <section className="soft-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="size-4 text-orange-300" />
        <h3 className="font-bold text-white">Territórios em guerra</h3>
      </div>
      <div className="space-y-2">
        {territories.map((territory) => {
          const gap = takeoverGap(territory.topScores ?? []);
          return (
            <Link
              href={`/territory/${territory.slug}`}
              key={territory.id}
              className="block rounded-lg border border-orange-400/15 bg-orange-400/5 p-3 hover:border-orange-300/50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-100">{territory.name}</span>
                <span className="text-xs text-orange-200">{formatCurrency(gap.amountCents)}</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">{formatPoints(gap.points)} pontos para virar</div>
            </Link>
          );
        })}
        {!territories.length ? <p className="text-sm text-zinc-500">Nenhuma guerra ativa agora.</p> : null}
      </div>
    </section>
  );
}
