"use client";

import { useMemo, useState } from "react";
import { MapControls } from "@/components/MapControls";
import { statusToColor } from "@/components/TerritoryHeatLegend";
import { TerritoryTooltip } from "@/components/TerritoryTooltip";
import { formatPoints, territoryTypeLabel } from "@/lib/format";
import type { TerritorySummary } from "@/types/domain";

const countryShapes: Record<string, string> = {
  "estados-unidos": "M146 146 C176 120 230 120 265 145 C250 178 206 196 157 182 C132 174 122 162 146 146Z",
  brasil: "M376 252 C408 228 453 236 472 270 C487 299 470 336 438 354 C406 337 377 311 376 252Z",
  argentina: "M402 358 C425 358 440 390 433 426 C414 419 398 389 402 358Z",
  portugal: "M429 172 C437 160 448 163 448 180 C440 184 432 183 429 172Z",
  japao: "M740 188 C758 178 772 188 765 207 C748 216 735 206 740 188Z",
};

const project = (latitude: number, longitude: number) => ({
  x: ((longitude + 180) / 360) * 900,
  y: ((90 - latitude) / 180) * 450,
});

export function WorldMap({
  territories,
  selectedSlug,
  onSelect,
}: {
  territories: TerritorySummary[];
  selectedSlug?: string;
  onSelect: (territory: TerritorySummary) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const bySlug = useMemo(() => new Map(territories.map((territory) => [territory.slug, territory])), [territories]);
  const markerTerritories = territories.filter(
    (territory) => territory.latitude !== null && territory.longitude !== null && territory.type !== "COUNTRY",
  );

  const selectBySlug = (slug: string) => {
    const territory = bySlug.get(slug);
    if (territory) onSelect(territory);
  };

  const showTooltip = (event: React.MouseEvent, territory: TerritorySummary) => {
    const target = event.currentTarget as SVGElement;
    const rect = target.ownerSVGElement?.getBoundingClientRect();
    setTooltip({
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
      title: territory.name,
      subtitle: `${territoryTypeLabel(territory.type)} · ${formatPoints(territory.totalPoints)} pts`,
    });
  };

  return (
    <div className="relative h-[58vh] min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 map-grid md:h-[calc(100vh-8.5rem)]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Mapa competitivo</div>
          <div className="text-sm font-semibold text-zinc-100">Clique em um território para abrir a disputa</div>
        </div>
        <div className="rounded-lg border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200">
          São Paulo está em guerra
        </div>
      </div>

      <svg
        viewBox="0 0 900 450"
        className="h-full w-full pt-12"
        role="img"
        aria-label="Mapa mundial competitivo de territórios"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="hsl(142 76% 45% / 0.14)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="900" height="450" fill="url(#mapGlow)" />
        <g transform={`translate(${450 * (1 - zoom)} ${230 * (1 - zoom)}) scale(${zoom})`}>
          <path d="M50 198 C98 160 180 196 226 220 C284 250 326 228 351 192 C390 136 458 142 508 172 C558 202 608 188 652 156 C706 116 794 138 842 184 C800 236 720 236 662 216 C616 200 568 218 518 252 C450 300 374 306 318 280 C266 256 202 256 150 286 C102 314 58 266 50 198Z" fill="hsl(222 16% 18% / 0.7)" stroke="hsl(222 16% 28%)" strokeWidth="1" />

          {Object.entries(countryShapes).map(([slug, d]) => {
            const territory = bySlug.get(slug);
            const status = territory?.status ?? "NONE";
            const selected = selectedSlug === slug;
            return (
              <path
                key={slug}
                d={d}
                fill={statusToColor(status)}
                fillOpacity={status === "NONE" ? 0.26 : selected ? 0.82 : 0.58}
                stroke={selected ? "white" : statusToColor(status)}
                strokeWidth={selected ? 3 : 1.4}
                className={status === "WAR" ? "territory-war cursor-pointer" : status === "DOMINATED" ? "territory-gold cursor-pointer" : "cursor-pointer"}
                onClick={() => selectBySlug(slug)}
                onMouseMove={(event) => territory && showTooltip(event, territory)}
              />
            );
          })}

          {markerTerritories.map((territory) => {
            const point = project(territory.latitude ?? 0, territory.longitude ?? 0);
            const radius = territory.type === "STATE" ? 9 : 6;
            const selected = selectedSlug === territory.slug;
            const color = statusToColor(territory.status);
            return (
              <g key={territory.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius + (selected ? 5 : 0)}
                  fill={color}
                  fillOpacity={selected ? 0.86 : 0.68}
                  stroke={selected ? "white" : color}
                  strokeWidth={selected ? 3 : 1.5}
                  className={territory.status === "WAR" ? "territory-war cursor-pointer" : territory.status === "DOMINATED" ? "territory-gold cursor-pointer" : "cursor-pointer"}
                  onClick={() => onSelect(territory)}
                  onMouseMove={(event) => showTooltip(event, territory)}
                />
                {territory.status === "WAR" ? (
                  <circle cx={point.x} cy={point.y} r={radius + 9} fill="none" stroke={color} strokeOpacity="0.32" />
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      <MapControls
        onZoomIn={() => setZoom((value) => Math.min(1.8, Number((value + 0.2).toFixed(1))))}
        onZoomOut={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))))}
      />
      {tooltip ? <TerritoryTooltip {...tooltip} /> : null}
    </div>
  );
}
