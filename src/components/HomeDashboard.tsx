"use client";

import { CreditCard, Globe2, Swords, Users } from "lucide-react";
import { useState } from "react";
import { BattleFeed } from "@/components/BattleFeed";
import { CheapToConquerCard } from "@/components/CheapToConquerCard";
import { CTAConquerCard } from "@/components/CTAConquerCard";
import { GlobalRankingCard } from "@/components/GlobalRankingCard";
import { StatsCard } from "@/components/StatsCard";
import { TerritoryHeatLegend } from "@/components/TerritoryHeatLegend";
import { TerritoryPanel } from "@/components/TerritoryPanel";
import { WarZonesCard } from "@/components/WarZonesCard";
import { WorldMap } from "@/components/WorldMap";
import { formatCurrency, formatPoints } from "@/lib/format";
import type { RankingRow, RankEventSummary, TerritorySummary } from "@/types/domain";

export function HomeDashboard({
  territories,
  selectedTerritory,
  warZones,
  cheapTerritories,
  events,
  globalRanking,
  stats,
}: {
  territories: TerritorySummary[];
  selectedTerritory: TerritorySummary | null;
  warZones: TerritorySummary[];
  cheapTerritories: Array<{ territory: TerritorySummary; gap: { amountCents: number; points: number } }>;
  events: RankEventSummary[];
  globalRanking: RankingRow[];
  stats: {
    totalRaisedCents: number;
    totalPoints: number;
    activeTerritories: number;
    warZones: number;
  };
}) {
  const [selected, setSelected] = useState<TerritorySummary | null>(selectedTerritory);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatsCard label="Total arrecadado" value={formatCurrency(stats.totalRaisedCents)} detail="Pix aprovado" icon={CreditCard} />
        <StatsCard label="Pontos no mapa" value={formatPoints(stats.totalPoints)} detail="Ranking real" icon={Globe2} />
        <StatsCard label="Territórios ativos" value={formatPoints(stats.activeTerritories)} detail="Com disputa" icon={Users} />
        <StatsCard label="Guerras" value={formatPoints(stats.warZones)} detail="Diferença até 500 pts" icon={Swords} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <WorldMap territories={territories} selectedSlug={selected?.slug} onSelect={setSelected} />
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <TerritoryPanel territory={selected} />
          <TerritoryHeatLegend />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <WarZonesCard territories={warZones} />
        <CheapToConquerCard items={cheapTerritories} />
        <GlobalRankingCard rows={globalRanking} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <BattleFeed events={events} />
        <div className="space-y-5">
          <CTAConquerCard />
          <section id="como-funciona" className="soft-card p-5">
            <h3 className="font-black text-white">Como funciona</h3>
            <p className="mt-2 text-sm text-zinc-400">Cada R$1,00 confirmado vale 100 pontos. O dono é quem lidera o placar daquele território.</p>
          </section>
          <section id="comunidade" className="soft-card p-5">
            <h3 className="font-black text-white">Comunidade</h3>
            <p className="mt-2 text-sm text-zinc-400">Microvitórias locais, rankings públicos e eventos recentes tornam cada tomada visível.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
