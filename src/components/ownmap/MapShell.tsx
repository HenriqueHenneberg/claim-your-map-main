"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import worldAtlas from "world-atlas/countries-110m.json";
import {
  Crosshair,
  Flame,
  ImageIcon,
  Layers3,
  LocateFixed,
  Palette,
  Search,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  allStaticTerritories,
  brazilStates,
  cityTerritories,
  createCountryTerritory,
  formatOwnMapCurrency,
  formatOwnMapPoints,
  getExpandedRanking,
  modeLabels,
  statusLabels,
  titleForOwnMapTerritory,
  typeLabels,
  type OwnMapMode,
  type OwnMapStatus,
  type OwnMapTerritory,
} from "@/lib/ownmap-data";
import { territoryVisualStyle } from "@/lib/ownmap-visuals";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

const MAP_WIDTH = 980;
const MAP_HEIGHT = 580;

type CountryProperties = { name?: string };
type BrazilStateProperties = { codarea?: string; name?: string; uf?: string; slug?: string | null };
type ViewLevel = "world" | "country" | "state" | "city";
type Transform = { x: number; y: number; k: number };
type Tooltip = { x: number; y: number; territory: OwnMapTerritory };

type Customization = {
  bannerUrl?: string;
  avatarUrl?: string;
  message?: string;
  accent?: string;
  emblem?: string;
};

const worldTopology = worldAtlas as unknown as Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;

const initialSelection = cityTerritories.find((territory) => territory.slug === "curitiba-parana") ?? cityTerritories[0];

const statusColors: Record<OwnMapStatus, string> = {
  empty: "#26313d",
  active: "#1f7a4b",
  contested: "#30b46b",
  dominated: "#d4a736",
  war: "#e46c3a",
};

const typeOrder = { country: 0, state: 1, city: 2 };

function rewindBrazilGeometry(geometry: Geometry): Geometry {
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => [...ring].reverse()),
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => [...ring].reverse())),
    };
  }

  return geometry;
}

function normalizeBrazilGeojson(
  geojson: FeatureCollection<Geometry, BrazilStateProperties>,
): FeatureCollection<Geometry, BrazilStateProperties> {
  return {
    ...geojson,
    features: geojson.features.map((state) => ({
      ...state,
      geometry: rewindBrazilGeometry(state.geometry),
    })),
  };
}

function colorForTerritory(territory: OwnMapTerritory, mode: OwnMapMode) {
  if (mode === "war") return territory.status === "war" ? "#e46c3a" : "#25313d";
  if (mode === "opportunity") {
    if (territory.status === "empty") return "#3a4654";
    if (territory.gapPoints <= 500) return "#d4a736";
    if (territory.gapPoints <= 1200) return "#30b46b";
    return "#26313d";
  }
  if (mode === "owners") return territory.owner?.accent ?? statusColors[territory.status];
  if (mode === "revenue") {
    if (territory.totalCents > 180000) return "#d4a736";
    if (territory.totalCents > 60000) return "#30b46b";
    if (territory.totalCents > 0) return "#1f7a4b";
    return "#26313d";
  }
  return statusColors[territory.status];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function cleanText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function statusTone(status: OwnMapStatus) {
  const tones: Record<OwnMapStatus, string> = {
    empty: "border-slate-600/50 bg-slate-700/30 text-slate-200",
    active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    contested: "border-emerald-400/40 bg-emerald-400/15 text-emerald-100",
    dominated: "border-amber-400/50 bg-amber-400/15 text-amber-100",
    war: "border-orange-400/50 bg-orange-500/15 text-orange-100",
  };
  return tones[status];
}

function ctaForTerritory(territory: OwnMapTerritory) {
  if (territory.status === "empty") return "Ser o primeiro dono por R$1";
  if (territory.gapPoints <= 500) return `Virar ${titleForOwnMapTerritory(territory).split(" de ")[0]} por ${formatOwnMapCurrency(territory.gapPoints)}`;
  if (territory.gapPoints <= 1200) return `Ultrapassar lider por ${formatOwnMapCurrency(territory.gapPoints)}`;
  return `Disputar ${territory.name}`;
}

function rankRole(territory: OwnMapTerritory, index: number) {
  if (index === 0) return titleForOwnMapTerritory(territory);
  if (index === 1) return "Vice-lider";
  if (index === 2) return "Rival direto";
  if (territory.type === "state") return "Conselho estadual";
  if (territory.type === "country") return "Elite nacional";
  return "Elite local";
}

function pointsToCurrency(points: number) {
  return formatOwnMapCurrency(Math.max(100, points));
}

function MapModeSelector({ mode, onChange }: { mode: OwnMapMode; onChange: (mode: OwnMapMode) => void }) {
  const modes: OwnMapMode[] = ["dispute", "revenue", "war", "opportunity", "owners"];
  return (
    <div className="ownmap-glass ownmap-scrollbar-none pointer-events-auto flex w-full max-w-[calc(100vw-1.5rem)] gap-1 overflow-x-auto p-1 md:w-auto md:max-w-none">
      {modes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold transition ${
            mode === item ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          {modeLabels[item]}
        </button>
      ))}
    </div>
  );
}

function HeatLegend({ mode }: { mode: OwnMapMode }) {
  const labels =
    mode === "opportunity"
      ? [
          ["#d4a736", "Tomada barata"],
          ["#30b46b", "Boa janela"],
          ["#26313d", "Mais caro"],
        ]
      : mode === "war"
        ? [
            ["#e46c3a", "Guerra ativa"],
            ["#25313d", "Fora de guerra"],
          ]
        : [
            [statusColors.empty, "Sem dono"],
            [statusColors.active, "Ativo"],
            [statusColors.contested, "Disputado"],
            [statusColors.dominated, "Dominado"],
            [statusColors.war, "Guerra"],
          ];

  return (
    <div className="ownmap-glass pointer-events-auto hidden min-w-52 p-3 text-xs text-slate-300 md:block">
      <div className="mb-2 flex items-center gap-2 font-bold text-white">
        <Layers3 className="size-3.5 text-amber-300" />
        Modo {modeLabels[mode]}
      </div>
      <div className="grid gap-1.5">
        {labels.map(([color, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeInsight({ mode, territories }: { mode: OwnMapMode; territories: OwnMapTerritory[] }) {
  const copy: Record<OwnMapMode, string> = {
    dispute: `${territories.filter((item) => item.status === "war" || item.status === "contested").length} territorios com disputa quente agora.`,
    revenue: `${territories.filter((item) => item.totalCents > 60000).length} territorios ja passaram de R$600 simbolicos.`,
    war: `${territories.filter((item) => item.status === "war").length} guerras onde poucos reais mudam o dono.`,
    opportunity: `${territories.filter((item) => item.gapPoints <= 500 || item.status === "empty").length} lugares baratos para aparecer hoje.`,
    owners: "As cores seguem a estetica escolhida pelos donos atuais.",
  };

  return (
    <div className="ownmap-glass pointer-events-auto hidden max-w-xs p-3 text-xs text-slate-300 md:block">
      <div className="flex items-center gap-2 font-black text-white">
        <Sparkles className="size-3.5 text-amber-300" />
        O que olhar
      </div>
      <p className="mt-1 leading-relaxed">{copy[mode]}</p>
    </div>
  );
}

function TerritorySearch({
  territories,
  onSelect,
}: {
  territories: OwnMapTerritory[];
  onSelect: (territory: OwnMapTerritory) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const text = cleanText(query.trim());
    if (!text) return territories.filter((territory) => territory.featured).slice(0, 8);
    return territories
      .filter((territory) =>
        cleanText(`${territory.name} ${territory.state ?? ""} ${territory.country ?? ""} ${(territory.aliases ?? []).join(" ")}`).includes(text),
      )
      .sort((a, b) => typeOrder[a.type] - typeOrder[b.type] || b.points - a.points)
      .slice(0, 14);
  }, [query, territories]);

  return (
    <div className="ownmap-glass pointer-events-auto relative w-full max-w-2xl p-2">
      <div className="flex items-center gap-2">
        <Search className="ml-2 size-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder="Buscar pais, estado ou cidade"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {(open || query) && (
        <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-white/10 bg-slate-950/95 p-1 shadow-2xl">
          {results.map((territory) => (
            <button
              key={territory.id}
              type="button"
              onClick={() => {
                onSelect(territory);
                setQuery("");
                setOpen(false);
              }}
              className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-md px-3 py-2 text-left hover:bg-white/[0.08]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">{territory.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {[territory.city, territory.state, territory.country].filter(Boolean).join(", ") || "Territorio global"}
                </span>
              </span>
              <span className={`self-center rounded-full border px-2 py-1 text-[10px] font-bold ${statusTone(territory.status)}`}>
                {typeLabels[territory.type]}
              </span>
            </button>
          ))}
          {!results.length ? <div className="p-3 text-sm text-slate-500">Nenhum territorio encontrado.</div> : null}
        </div>
      )}
    </div>
  );
}

function TerritoryTooltip({ tooltip, mode }: { tooltip: Tooltip | null; mode: OwnMapMode }) {
  if (!tooltip) return null;
  const { territory } = tooltip;
  return (
    <div
      className="pointer-events-none absolute z-30 w-72 rounded-xl border border-white/[0.12] bg-slate-950/[0.92] p-3 shadow-2xl backdrop-blur"
      style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}
    >
      <div className="flex items-center gap-3">
        <span className="size-9 rounded-lg border border-white/10 bg-cover bg-center" style={territoryVisualStyle(territory)} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-white">{territory.name}</span>
          <span className="text-xs text-slate-400">{typeLabels[territory.type]} - {statusLabels[territory.status]}</span>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-lg bg-white/5 p-2 text-slate-300">{formatOwnMapPoints(territory.points)} pts</span>
        <span className="rounded-lg bg-white/5 p-2 text-slate-300">faltam {pointsToCurrency(territory.gapPoints)}</span>
      </div>
      <div className="mt-2 text-xs text-slate-500">Visualizando por {modeLabels[mode].toLowerCase()}.</div>
    </div>
  );
}

function OwnerAvatar({ territory, custom }: { territory: OwnMapTerritory; custom?: Customization }) {
  const owner = territory.owner;
  const avatarUrl = custom?.avatarUrl || owner?.avatarUrl;
  return avatarUrl ? (
    <img src={avatarUrl} alt="" className="size-12 rounded-xl object-cover ring-2 ring-white/10" />
  ) : (
    <span className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white">
      {initials(owner?.name ?? "Livre")}
    </span>
  );
}

function TerritoryPanel({
  territory,
  custom,
  onCustomChange,
  onDispute,
  onClose,
}: {
  territory: OwnMapTerritory;
  custom?: Customization;
  onCustomChange: (custom: Customization) => void;
  onDispute: (territory: OwnMapTerritory) => void;
  onClose?: () => void;
}) {
  const owner = territory.owner;
  const message = custom?.message || owner?.message || "Territorio livre para quem chegar primeiro.";
  const accent = custom?.accent || owner?.accent || statusColors[territory.status];
  const bannerUrl = custom?.bannerUrl || territory.bannerUrl;
  const [rankLimit, setRankLimit] = useState(10);
  const rankingRows = useMemo(() => getExpandedRanking(territory, rankLimit), [territory, rankLimit]);
  const topThree = rankingRows.slice(0, 3);

  return (
    <aside className="ownmap-panel flex max-h-[74vh] flex-col overflow-hidden rounded-2xl lg:max-h-[calc(100vh-7.5rem)]">
      <div className="relative h-36 shrink-0 bg-cover bg-center sm:h-40" style={territoryVisualStyle(territory, bannerUrl)}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg bg-black/40 p-2 text-white backdrop-blur lg:hidden"
          aria-label="Fechar painel"
        >
          <X className="size-4" />
        </button>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: `${accent}80`, color: accent }}>
              {typeLabels[territory.type]} - {statusLabels[territory.status]}
            </div>
            <h2 className="text-2xl font-black text-white">{territory.name}</h2>
            <p className="text-xs text-slate-300">{[territory.city, territory.state, territory.country].filter(Boolean).join(", ")}</p>
          </div>
          <Link href={`/territory/${territory.slug}`} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950">
            Detalhes
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <OwnerAvatar territory={territory} custom={custom} />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Dono atual</div>
              <div className="truncate font-black text-white">{owner?.name ?? "Sem dono"}</div>
              <div className="truncate text-xs text-slate-400">
                {owner?.title ?? titleForOwnMapTerritory(territory)}{owner?.customTitle ? ` - ${owner.customTitle}` : ""}
              </div>
            </div>
          </div>
          <p className="mt-3 rounded-lg border border-white/[0.08] bg-slate-950/50 p-3 text-sm leading-relaxed text-slate-200">"{message}"</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Dono" value={formatOwnMapPoints(territory.ownerPoints)} />
          <Metric label="Total" value={formatOwnMapPoints(territory.points)} />
          <Metric label="Valor" value={formatOwnMapCurrency(territory.totalCents)} className="col-span-2" />
        </div>

        <div className="mt-3 rounded-xl border border-orange-400/20 bg-orange-400/10 p-3 text-sm text-orange-100">
          <Swords className="mr-2 inline size-4" />
          Faltam so {formatOwnMapPoints(territory.gapPoints)} pontos para tomar {territory.name}.
          <span className="block text-xs text-orange-200/80">Voce esta a {pointsToCurrency(territory.gapPoints)} de virar {titleForOwnMapTerritory(territory).split(" de ")[0]}.</span>
        </div>

        <button
          type="button"
          onClick={() => onDispute(territory)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-100"
        >
          <Crosshair className="size-4" />
          {ctaForTerritory(territory)}
        </button>

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-white">
              <Trophy className="size-4 text-amber-300" />
              Ranking local
            </h3>
            <div className="flex rounded-lg border border-white/10 bg-slate-950/60 p-1">
              {[10, 50, 100].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setRankLimit(limit)}
                  className={`rounded-md px-2 py-1 text-[10px] font-black ${rankLimit === limit ? "bg-white text-slate-950" : "text-slate-400"}`}
                >
                  Top {limit}
                </button>
              ))}
            </div>
          </div>
          {topThree.length ? (
            <div className="mb-3 grid gap-2">
              {topThree.map((rank, index) => {
                const diff = index === 0 ? territory.gapPoints : Math.max(100, topThree[index - 1].points - rank.points);
                return (
                  <div key={`${rank.name}-podium-${index}`} className={`rounded-xl border p-3 ${index === 0 ? "border-amber-300/30 bg-amber-300/10" : "border-white/10 bg-white/[0.04]"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-500">#{index + 1}</span>
                      <img src={rank.avatarUrl} alt="" className="size-9 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-white">{rank.name}</span>
                        <span className="block truncate text-xs text-slate-500">{rankRole(territory, index)}</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-200">{formatOwnMapPoints(rank.points)}</span>
                    </div>
                    {index > 0 ? <div className="mt-2 text-xs text-slate-400">faltam {formatOwnMapPoints(diff)} pts / {pointsToCurrency(diff)} para passar</div> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div className="space-y-2">
            {rankingRows.length ? (
              rankingRows.slice(3, Math.min(rankLimit, 12)).map((rank, index) => {
                const position = index + 4;
                const previous = rankingRows[position - 2];
                const diff = Math.max(100, (previous?.points ?? rank.points + 100) - rank.points);
                return (
                  <div key={`${rank.name}-${position}`} className="grid grid-cols-[36px_1fr_auto] items-center gap-2 rounded-lg bg-white/[0.04] p-2">
                    <span className="text-sm font-black text-slate-500">#{position}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{rank.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">faltam {pointsToCurrency(diff)} para passar</span>
                    </span>
                    <button type="button" onClick={() => onDispute(territory)} className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black text-slate-200 hover:bg-white/10">
                      Ultrapassar
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-500">Este territorio esta livre. Seja o primeiro dono.</div>
            )}
          </div>
        </section>

        <section className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-white">
            <Sparkles className="size-4 text-amber-300" />
            Personalizacao do territorio
          </h3>
          <div className="grid gap-2">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3 text-xs text-slate-400">
              Este territorio foi personalizado por <span className="font-bold text-white">{owner?.name ?? "ninguem ainda"}</span>. Conteudo publico podera passar por moderacao.
            </div>
            <label className="grid gap-1 text-xs font-bold text-slate-300">
              URL do banner
              <input
                value={custom?.bannerUrl ?? ""}
                onChange={(event) => onCustomChange({ ...custom, bannerUrl: event.target.value })}
                placeholder="https://..."
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-normal text-white outline-none focus:border-amber-300/70"
              />
            </label>
            <label className="grid gap-1 text-xs font-bold text-slate-300">
              Mensagem publica
              <input
                value={custom?.message ?? ""}
                onChange={(event) => onCustomChange({ ...custom, message: event.target.value })}
                placeholder="Curitiba e nossa..."
                maxLength={80}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-normal text-white outline-none focus:border-amber-300/70"
              />
            </label>
            <div className="grid grid-cols-[1fr_88px] gap-2">
              <label className="grid gap-1 text-xs font-bold text-slate-300">
                Avatar URL
                <input
                  value={custom?.avatarUrl ?? ""}
                  onChange={(event) => onCustomChange({ ...custom, avatarUrl: event.target.value })}
                  placeholder="https://..."
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-normal text-white outline-none focus:border-amber-300/70"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-300">
                Cor
                <input
                  type="color"
                  value={custom?.accent ?? accent}
                  onChange={(event) => onCustomChange({ ...custom, accent: event.target.value })}
                  className="h-10 rounded-lg border border-white/10 bg-slate-950 p-1"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <h3 className="mb-2 text-sm font-black text-white">Eventos recentes</h3>
          <div className="space-y-2">
            {territory.events.map((event) => (
              <div key={event} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-xs text-slate-300">
                {event}
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function DisputeSimulator({ territory, onClose }: { territory: OwnMapTerritory; onClose: () => void }) {
  const quickValues = [1, 2, 5, 10, 25];
  const [amount, setAmount] = useState(territory.gapPoints <= 500 ? Math.max(1, Math.ceil(territory.gapPoints / 100)) : 5);
  const points = amount * 100;
  const currentRanking = getExpandedRanking(territory, 10);
  const previewPosition =
    territory.status === "empty" || points >= territory.gapPoints
      ? 1
      : points >= 1000
        ? 2
        : points >= 500
          ? Math.min(5, currentRanking.length + 1)
          : Math.min(10, currentRanking.length + 1);
  const impact =
    territory.status === "empty"
      ? "voce estreia o territorio como dono"
      : points >= territory.gapPoints
        ? `voce toma ${territory.name}`
        : previewPosition <= 3
          ? `voce entra no Top ${previewPosition}`
          : "voce aparece na elite local";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-3 backdrop-blur-sm md:items-center md:justify-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="relative h-32 bg-cover bg-center" style={territoryVisualStyle(territory)}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-lg bg-black/45 p-2 text-white" aria-label="Fechar simulador">
            <X className="size-4" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">Simular disputa</div>
            <h3 className="text-2xl font-black text-white">{territory.name}</h3>
          </div>
        </div>
        <div className="grid gap-4 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm text-slate-300">Cada R$1 vira 100 pontos. Com <span className="font-black text-white">{formatOwnMapCurrency(amount * 100)}</span>, {impact}.</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-300" style={{ width: `${Math.min(100, (points / Math.max(100, territory.gapPoints)) * 100)}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {quickValues.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-xl border px-2 py-3 text-sm font-black ${amount === value ? "border-white bg-white text-slate-950" : "border-white/10 text-slate-200 hover:bg-white/10"}`}
              >
                R${value}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Pontos" value={formatOwnMapPoints(points)} />
            <Metric label="Nova posicao" value={`#${previewPosition}`} />
            <Metric label="Faltam" value={points >= territory.gapPoints ? "0" : formatOwnMapPoints(territory.gapPoints - points)} />
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 hover:bg-amber-100">
            {points >= territory.gapPoints || territory.status === "empty" ? ctaForTerritory(territory) : `Entrar na disputa com ${formatOwnMapCurrency(amount * 100)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-3 ${className}`}>
      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-black leading-tight text-white">{value}</div>
    </div>
  );
}

function ExploreTerritoriesList({
  territories,
  selectedSlug,
  onSelect,
}: {
  territories: OwnMapTerritory[];
  selectedSlug?: string;
  onSelect: (territory: OwnMapTerritory) => void;
}) {
  const [filter, setFilter] = useState("war");
  const filters = [
    ["war", "Em guerra"],
    ["dominated", "Dominados"],
    ["empty", "Sem dono"],
    ["cheap", "Baratos"],
    ["disputed", "Mais disputados"],
    ["near", "Perto de voce"],
  ];
  const list = useMemo(() => {
    const filtered = territories.filter((territory) => {
      if (filter === "war") return territory.status === "war";
      if (filter === "dominated") return territory.status === "dominated";
      if (filter === "empty") return territory.status === "empty";
      if (filter === "cheap") return territory.gapPoints <= 800 || territory.status === "empty";
      if (filter === "near") return territory.country === "Brasil" && (territory.state === "Parana" || territory.state === "Sao Paulo");
      return territory.points > 0;
    });
    return filtered.sort((a, b) => (filter === "cheap" ? a.gapPoints - b.gapPoints : b.heat - a.heat)).slice(0, 18);
  }, [filter, territories]);

  return (
    <section id="explorar" className="ownmap-section mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="ownmap-eyebrow">Explorar territorios</div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Ache a proxima tomada</h2>
        </div>
        <div className="flex gap-2 overflow-auto pb-1">
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${
                filter === id ? "border-white bg-white text-slate-950" : "border-white/10 text-slate-300 hover:border-white/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((territory) => (
          <button
            key={territory.id}
            type="button"
            onClick={() => onSelect(territory)}
            className={`group grid grid-cols-[64px_1fr_auto] gap-3 rounded-2xl border p-3 text-left transition ${
              selectedSlug === territory.slug ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-white/[0.035] hover:border-white/25"
            }`}
          >
            <span className="h-16 rounded-xl bg-cover bg-center" style={territoryVisualStyle(territory)} />
            <span className="min-w-0 self-center">
              <span className="block truncate font-black text-white">{territory.name}</span>
              <span className="block truncate text-xs text-slate-500">{typeLabels[territory.type]} - {statusLabels[territory.status]}</span>
              <span className="mt-1 block truncate text-xs text-slate-400">
                {territory.owner?.name ?? "Livre"} - faltam {formatOwnMapPoints(territory.gapPoints)} pts
              </span>
            </span>
            <span className="self-center rounded-full px-2 py-1 text-[10px] font-black text-slate-950" style={{ backgroundColor: statusColors[territory.status] }}>
              {formatOwnMapPoints(territory.points)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function MapShell({ initialSlug }: { initialSlug?: string }) {
  const [brazilGeo, setBrazilGeo] = useState<FeatureCollection<Geometry, BrazilStateProperties> | null>(null);
  const [mode, setMode] = useState<OwnMapMode>("dispute");
  const [viewLevel, setViewLevel] = useState<ViewLevel>("world");
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, Customization>>({});
  const [panelOpen, setPanelOpen] = useState(Boolean(initialSlug));
  const [simulatorTerritory, setSimulatorTerritory] = useState<OwnMapTerritory | null>(null);
  const dragRef = useRef<{ x: number; y: number; start: Transform } | null>(null);
  const bodyOverflowRef = useRef<string | null>(null);
  const mapStageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const countries = useMemo(
    () => feature(worldTopology, worldTopology.objects.countries) as FeatureCollection<Geometry, CountryProperties>,
    [],
  );
  const projection = useMemo(() => geoNaturalEarth1().fitExtent([[18, 46], [962, 548]], { type: "Sphere" }), []);
  const path = useMemo(() => geoPath(projection), [projection]);

  const countryTerritories = useMemo(
    () =>
      countries.features.map((country, index) => {
        const iso = String(country.id ?? "").padStart(3, "0");
        return createCountryTerritory(iso, country.properties?.name ?? "Territorio", index);
      }),
    [countries.features],
  );

  const allTerritories = useMemo(
    () => [...countryTerritories, ...allStaticTerritories].sort((a, b) => typeOrder[a.type] - typeOrder[b.type] || b.points - a.points),
    [countryTerritories],
  );

  const countryFeatureBySlug = useMemo(() => {
    const map = new Map<string, Feature<Geometry, CountryProperties>>();
    countries.features.forEach((country, index) => {
      const iso = String(country.id ?? "").padStart(3, "0");
      const territory = createCountryTerritory(iso, country.properties?.name ?? "Territorio", index);
      map.set(territory.slug, country);
    });
    return map;
  }, [countries.features]);

  const stateFeatureByCode = useMemo(() => {
    const map = new Map<string, Feature<Geometry, BrazilStateProperties>>();
    brazilGeo?.features.forEach((state) => {
      if (state.properties?.codarea) map.set(state.properties.codarea, state);
    });
    return map;
  }, [brazilGeo]);

  const territoryBySlug = useMemo(() => new Map(allTerritories.map((territory) => [territory.slug, territory])), [allTerritories]);
  const initialTerritory = (initialSlug ? territoryBySlug.get(initialSlug) : null) ?? initialSelection;
  const [selected, setSelected] = useState<OwnMapTerritory>(initialTerritory);

  useEffect(() => {
    fetch("/maps/brazil-states.geojson")
      .then((response) => response.json())
      .then((geojson: FeatureCollection<Geometry, BrazilStateProperties>) => setBrazilGeo(normalizeBrazilGeojson(geojson)))
      .catch(() => setBrazilGeo(null));
  }, []);

  useEffect(() => {
    if (!initialSlug) return;
    const territory = territoryBySlug.get(initialSlug);
    if (territory) selectTerritory(territory);
  }, [initialSlug, territoryBySlug]);

  useEffect(() => {
    const stage = mapStageRef.current;
    if (!stage) return undefined;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      zoomAt(event.clientX, event.clientY, event.deltaY);
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  });

  const zoomToBounds = (bounds: [[number, number], [number, number]], maxScale = 8) => {
    const [[x0, y0], [x1, y1]] = bounds;
    const dx = Math.max(1, x1 - x0);
    const dy = Math.max(1, y1 - y0);
    const scale = Math.min(maxScale, Math.max(1, 0.82 / Math.max(dx / MAP_WIDTH, dy / MAP_HEIGHT)));
    setTransform({
      k: Number(scale.toFixed(3)),
      x: Number((MAP_WIDTH / 2 - scale * ((x0 + x1) / 2)).toFixed(2)),
      y: Number((MAP_HEIGHT / 2 - scale * ((y0 + y1) / 2)).toFixed(2)),
    });
  };

  const zoomToPoint = (longitude: number, latitude: number, scale = 5.2) => {
    const point = projection([longitude, latitude]);
    if (!point) return;
    setTransform({
      k: scale,
      x: Number((MAP_WIDTH / 2 - scale * point[0]).toFixed(2)),
      y: Number((MAP_HEIGHT / 2 - scale * point[1]).toFixed(2)),
    });
  };

  const zoomAt = (clientX: number | null, clientY: number | null, deltaY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const centerX = rect && clientX !== null ? ((clientX - rect.left) / rect.width) * MAP_WIDTH : MAP_WIDTH / 2;
    const centerY = rect && clientY !== null ? ((clientY - rect.top) / rect.height) * MAP_HEIGHT : MAP_HEIGHT / 2;
    const factor = deltaY > 0 ? 0.88 : 1.12;

    setTransform((current) => {
      const nextK = Math.min(9, Math.max(0.82, Number((current.k * factor).toFixed(3))));
      const worldX = (centerX - current.x) / current.k;
      const worldY = (centerY - current.y) / current.k;

      return {
        k: nextK,
        x: Number((centerX - worldX * nextK).toFixed(2)),
        y: Number((centerY - worldY * nextK).toFixed(2)),
      };
    });
  };

  const selectTerritory = (territory: OwnMapTerritory) => {
    setSelected(territory);
    setPanelOpen(true);
    setTooltip(null);
    if (territory.type === "country") {
      setViewLevel("country");
      const countryFeature = countryFeatureBySlug.get(territory.slug);
      if (countryFeature) zoomToBounds(path.bounds(countryFeature as never) as [[number, number], [number, number]], 2.2);
    }
    if (territory.type === "state") {
      setViewLevel("state");
      const stateFeature = territory.stateCode ? stateFeatureByCode.get(territory.stateCode) : null;
      if (stateFeature) zoomToBounds(path.bounds(stateFeature as never) as [[number, number], [number, number]], 7.5);
      else if (territory.longitude && territory.latitude) zoomToPoint(territory.longitude, territory.latitude, 4.2);
    }
    if (territory.type === "city" && territory.longitude && territory.latitude) {
      setViewLevel("city");
      zoomToPoint(territory.longitude, territory.latitude, 7.2);
    }
  };

  const resetWorld = () => {
    setViewLevel("world");
    setTransform({ x: 0, y: 0, k: 1 });
    setTooltip(null);
  };

  const selectCurrentCountry = () => {
    const country = countryTerritories.find((territory) => territory.name === selectedCountry);
    if (country) selectTerritory(country);
    else resetWorld();
  };

  const selectCurrentState = () => {
    const state = selected.state ? brazilStates.find((territory) => territory.state === selected.state) : undefined;
    if (state) selectTerritory(state);
  };

  const pointerPosition = (event: MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY, start: transform };
    if (bodyOverflowRef.current === null) {
      bodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    const captureTarget = event.target instanceof Element ? event.target : event.currentTarget;
    captureTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    event.preventDefault();
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setTransform({ ...dragRef.current.start, x: dragRef.current.start.x + dx, y: dragRef.current.start.y + dy });
  };

  const endDrag = (event?: PointerEvent<SVGSVGElement>) => {
    const captureTarget = event?.target instanceof Element ? event.target : event?.currentTarget;
    if (event && captureTarget?.hasPointerCapture?.(event.pointerId)) {
      captureTarget.releasePointerCapture(event.pointerId);
    } else if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    if (bodyOverflowRef.current !== null) {
      document.body.style.overflow = bodyOverflowRef.current;
      bodyOverflowRef.current = null;
    }
  };

  const selectedCountry = selected.type === "country" ? selected.name : selected.country;
  const selectedState = selected.state;
  const showBrazilStates =
    viewLevel !== "world" && (selectedCountry === "Brasil" || viewLevel === "state" || (viewLevel === "city" && selected.country === "Brasil"));
  const visibleCities = cityTerritories.filter((city) => {
    if (viewLevel === "world") return city.featured;
    if (viewLevel === "country") return selectedCountry === "Brasil" ? false : city.country === selectedCountry;
    if (viewLevel === "state") return city.country === selectedCountry && city.state === selectedState;
    if (viewLevel === "city") return city.country === selected.country && (!selected.state || city.state === selected.state);
    return false;
  });
  const breadcrumbItems = [
    { label: "Mundo", onClick: resetWorld },
    ...(viewLevel !== "world" && selectedCountry ? [{ label: selectedCountry, onClick: selectCurrentCountry }] : []),
    ...(viewLevel !== "world" && selected.state ? [{ label: selected.state, onClick: selectCurrentState }] : []),
    ...(viewLevel === "city" && selected.type === "city" ? [{ label: selected.name, onClick: () => selectTerritory(selected) }] : []),
  ];

  const selectedCustom = customizations[selected.slug];
  const compactStats = [
    { label: "Territorios", value: formatOwnMapPoints(allTerritories.length), icon: LocateFixed },
    { label: "Guerras", value: formatOwnMapPoints(allTerritories.filter((territory) => territory.status === "war").length), icon: Flame },
    { label: "Sem dono", value: formatOwnMapPoints(allTerritories.filter((territory) => territory.status === "empty").length), icon: Zap },
    { label: "Explorando", value: "12.8k", icon: Users },
  ];

  return (
    <div className="ownmap-root">
      <section className="relative min-h-0 overflow-hidden px-3 pb-3 pt-20 md:min-h-[calc(100vh-4rem)] md:px-5 md:pb-5">
        <div className="pointer-events-none absolute inset-x-3 top-20 z-20 flex flex-col gap-3 md:inset-x-5 lg:flex-row lg:items-start lg:justify-between lg:pr-[410px]">
          <div className="flex w-full flex-col gap-3 lg:max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {compactStats.map((stat) => (
                <div key={stat.label} className="ownmap-glass pointer-events-auto flex items-center gap-2 px-3 py-2">
                  <stat.icon className="size-4 text-amber-300" />
                  <span className="text-xs text-slate-400">{stat.label}</span>
                  <span className="text-xs font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
            <TerritorySearch territories={allTerritories} onSelect={selectTerritory} />
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <MapModeSelector mode={mode} onChange={setMode} />
            <HeatLegend mode={mode} />
            <ModeInsight mode={mode} territories={allTerritories} />
          </div>
        </div>

        <div
          ref={mapStageRef}
          className="ownmap-map-stage relative h-[380px] min-h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#071017] shadow-2xl shadow-black/40 md:h-[calc(100vh-6rem)] md:min-h-[620px]"
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="h-full w-full touch-none select-none outline-none"
            role="img"
            aria-label="Mapa interativo OwnMap"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onMouseLeave={() => setTooltip(null)}
          >
            <defs>
              <linearGradient id="oceanGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#071017" />
                <stop offset="100%" stopColor="#0b1620" />
              </linearGradient>
              <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#fff3b0" floodOpacity="0.7" />
              </filter>
            </defs>
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGradient)" />
            <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`} style={{ transition: dragRef.current ? "none" : "transform 460ms cubic-bezier(.2,.8,.2,1)" }}>
              {countries.features.map((country, index) => {
                const iso = String(country.id ?? "").padStart(3, "0");
                const territory = createCountryTerritory(iso, country.properties?.name ?? "Territorio", index);
                const d = path(country);
                const isSelected = selected.slug === territory.slug;
                const isDimmedForStateLayer = showBrazilStates && territory.slug === "brasil";
                if (!d) return null;
                return (
                  <path
                    key={`${iso}-${index}`}
                    d={d}
                    fillRule="evenodd"
                    fill={colorForTerritory(territory, mode)}
                    fillOpacity={isDimmedForStateLayer ? 0 : isSelected ? 0.72 : territory.status === "empty" ? 0.32 : 0.54}
                    stroke={isSelected ? "#fff3b0" : isDimmedForStateLayer ? "#8ba3b466" : "#273746"}
                    strokeWidth={isSelected ? 1.6 / transform.k : 0.58 / transform.k}
                    filter={isSelected ? "url(#selectedGlow)" : undefined}
                    className="cursor-pointer transition-[fill,fill-opacity,stroke] duration-300 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`${territory.name} - ${typeLabels[territory.type]}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.currentTarget.blur();
                      selectTerritory(territory);
                    }}
                    onMouseMove={(event) => {
                      const point = pointerPosition(event);
                      setTooltip({ ...point, territory });
                    }}
                  />
                );
              })}

              {showBrazilStates &&
                brazilGeo?.features.map((state) => {
                  const territory = state.properties?.codarea
                    ? brazilStates.find((item) => item.stateCode === state.properties?.codarea)
                    : undefined;
                  const d = path(state as Feature<Geometry, BrazilStateProperties>);
                  if (!territory || !d) return null;
                  const isSelected = selected.slug === territory.slug;
                  const isBrazilCountryLayer = viewLevel === "country" && selectedCountry === "Brasil";
                  return (
                    <path
                      key={territory.slug}
                      d={d}
                      fillRule="evenodd"
                      fill={colorForTerritory(territory, mode)}
                      fillOpacity={
                        isBrazilCountryLayer
                          ? isSelected
                            ? 0.44
                            : territory.status === "empty"
                              ? 0.16
                              : 0.28
                          : isSelected
                            ? 0.74
                            : territory.status === "empty"
                              ? 0.34
                              : 0.52
                      }
                      stroke={isSelected ? "#fff3b0" : "#d9e2ef99"}
                      strokeWidth={isSelected ? 1.25 / transform.k : 0.55 / transform.k}
                      filter={isSelected ? "url(#selectedGlow)" : undefined}
                      className="cursor-pointer transition-[fill,fill-opacity,stroke] duration-300 focus:outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${territory.name} - Estado`}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.currentTarget.blur();
                        selectTerritory(territory);
                      }}
                      onMouseMove={(event) => {
                        const point = pointerPosition(event);
                        setTooltip({ ...point, territory });
                      }}
                    />
                  );
                })}

              {showBrazilStates &&
                brazilStates.map((state) => {
                  if (typeof state.longitude !== "number" || typeof state.latitude !== "number") return null;
                  const point = projection([state.longitude, state.latitude]);
                  if (!point) return null;
                  const isSelected = selected.slug === state.slug;
                  const uf = state.id.replace("state-", "");
                  const color = colorForTerritory(state, mode);
                  return (
                    <g
                      key={`${state.slug}-marker`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${state.name} - marcador de estado`}
                      className="cursor-pointer focus:outline-none"
                      onClick={(event) => {
                        event.stopPropagation();
                        event.currentTarget.blur();
                        selectTerritory(state);
                      }}
                      onMouseMove={(event) => {
                        const pointPosition = pointerPosition(event);
                        setTooltip({ ...pointPosition, territory: state });
                      }}
                    >
                      <circle
                        cx={point[0]}
                        cy={point[1]}
                        r={(isSelected ? 5 : 3.2) / Math.sqrt(transform.k)}
                        fill={color}
                        stroke={isSelected ? "#fff3b0" : "#ffffffcc"}
                        strokeWidth={(isSelected ? 1.8 : 1) / transform.k}
                      />
                      <text
                        x={point[0]}
                        y={point[1] - 7 / Math.sqrt(transform.k)}
                        textAnchor="middle"
                        fontSize={8 / Math.sqrt(transform.k)}
                        fontWeight="900"
                        fill="#f8fafc"
                        stroke="#020617"
                        strokeWidth={2 / transform.k}
                        paintOrder="stroke"
                      >
                        {uf}
                      </text>
                    </g>
                  );
                })}

              {visibleCities.map((city) => {
                if (typeof city.longitude !== "number" || typeof city.latitude !== "number") return null;
                const point = projection([city.longitude, city.latitude]);
                if (!point) return null;
                const isSelected = selected.slug === city.slug;
                const color = colorForTerritory(city, mode);
                const radius = (isSelected ? 7.2 : city.status === "war" ? 5.5 : 4.5) / Math.sqrt(transform.k);
                return (
                  <g key={city.slug} className="cursor-pointer">
                    {city.status === "war" ? (
                      <circle cx={point[0]} cy={point[1]} r={radius * 2.8} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth={1.4 / transform.k} />
                    ) : null}
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r={radius}
                      fill={color}
                      stroke={isSelected ? "#fff3b0" : "#ffffffcc"}
                      strokeWidth={(isSelected ? 2 : 1.1) / transform.k}
                      filter={isSelected ? "url(#selectedGlow)" : undefined}
                      className="focus:outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${city.name} - Cidade`}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.currentTarget.blur();
                        selectTerritory(city);
                      }}
                      onMouseMove={(event) => {
                        const pointPosition = pointerPosition(event);
                        setTooltip({ ...pointPosition, territory: city });
                      }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          <TerritoryTooltip tooltip={tooltip} mode={mode} />

          {!panelOpen ? (
            <div className="pointer-events-none absolute left-1/2 top-28 z-20 hidden w-[360px] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/78 p-3 text-xs text-slate-300 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-2 font-black text-white">
                <Flame className="size-4 text-amber-300" />
                Ao vivo no mapa
              </div>
              <p className="mt-1">
                {selected.status === "empty"
                  ? `${selected.name} esta livre. Seja o primeiro dono.`
                  : selected.events[0] ?? `${selected.name} acabou de receber uma nova disputa.`}
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3">
            <div className="flex max-w-[calc(100%-5rem)] flex-col gap-2">
              <nav className="ownmap-glass pointer-events-auto flex max-w-full items-center gap-1 overflow-auto p-1" aria-label="Navegacao do mapa">
                {breadcrumbItems.map((item, index) => (
                  <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1">
                    {index ? <span className="text-xs text-slate-600">/</span> : null}
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="rounded-md px-2.5 py-2 text-xs font-black text-slate-200 hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </button>
                  </span>
                ))}
              </nav>
              {viewLevel !== "world" ? (
                <div className="ownmap-glass pointer-events-auto flex max-w-full items-center gap-1 overflow-auto p-1">
                  <button type="button" onClick={resetWorld} className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                    Voltar para mundo
                  </button>
                  {viewLevel === "state" || viewLevel === "city" ? (
                  <button type="button" onClick={selectCurrentCountry} className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                    Voltar para pais
                  </button>
                  ) : null}
                  {viewLevel === "city" && selected.state ? (
                  <button type="button" onClick={selectCurrentState} className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                    Voltar para estado
                  </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="ownmap-glass pointer-events-auto flex overflow-hidden p-1">
              <button type="button" onClick={() => zoomAt(null, null, -1)} className="size-9 rounded-md text-white hover:bg-white/10">+</button>
              <button type="button" onClick={() => zoomAt(null, null, 1)} className="size-9 rounded-md text-white hover:bg-white/10">-</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            if (!panelOpen) setPanelOpen(true);
          }}
          className={`fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border border-white/10 bg-slate-950/96 shadow-2xl backdrop-blur-xl transition-transform lg:absolute lg:inset-y-24 lg:right-5 lg:left-auto lg:w-[390px] lg:rounded-2xl ${
          panelOpen ? "translate-y-0 lg:translate-x-0" : "translate-y-[calc(100%-72px)] lg:translate-x-[calc(100%+1.5rem)] lg:translate-y-0"
        }`}
        >
          <TerritoryPanel
            territory={selected}
            custom={selectedCustom}
            onDispute={setSimulatorTerritory}
            onClose={() => setPanelOpen(false)}
            onCustomChange={(custom) => setCustomizations((current) => ({ ...current, [selected.slug]: custom }))}
          />
        </div>
        {simulatorTerritory ? (
          <DisputeSimulator territory={simulatorTerritory} onClose={() => setSimulatorTerritory(null)} />
        ) : null}
      </section>

      <ExploreTerritoriesList territories={allTerritories} selectedSlug={selected.slug} onSelect={selectTerritory} />

      <section className="ownmap-section mx-auto grid max-w-7xl gap-4 px-4 pb-12 md:grid-cols-3 md:px-6">
        <InfoCard icon={Swords} title="Territorios em guerra" text="Disputas com menos de 500 pontos de distancia aparecem em destaque." />
        <InfoCard icon={ImageIcon} title="Dono vira vitrine" text="O lider mostra banner, avatar, mensagem e emblema no territorio." />
        <InfoCard icon={Palette} title="Mapa por intencao" text="Alterne entre disputa, arrecadacao, guerra, oportunidade e donos." />
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <Icon className="size-5 text-amber-300" />
      <h3 className="mt-4 font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}
