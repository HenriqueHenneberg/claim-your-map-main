"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { MapControls } from "@/components/MapControls";
import { statusToColor } from "@/components/TerritoryHeatLegend";
import { TerritoryTooltip } from "@/components/TerritoryTooltip";
import { formatPoints, territoryTypeLabel } from "@/lib/format";
import type { TerritoryStatus, TerritorySummary } from "@/types/domain";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

const MAP_WIDTH = 900;
const MAP_HEIGHT = 500;
const MAP_CENTER = { x: MAP_WIDTH / 2, y: 250 };

type CountryProperties = {
  name?: string;
};

type BrazilStateProperties = {
  codarea?: string;
  name?: string;
  uf?: string;
  slug?: string | null;
};

type TooltipState = {
  x: number;
  y: number;
  title: string;
  subtitle: string;
};

const worldTopology = worldAtlas as unknown as Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;

const countryIsoToSlug: Record<string, string> = {
  "032": "argentina",
  "076": "brasil",
  "392": "japao",
  "620": "portugal",
  "840": "estados-unidos",
};

const statusClassName = (status: TerritoryStatus, interactive: boolean) => {
  const animation = status === "WAR" ? "territory-war" : status === "DOMINATED" ? "territory-gold" : "";
  return `${interactive ? "cursor-pointer" : "cursor-default"} ${animation}`.trim();
};

const getPointerPosition = (event: MouseEvent<SVGElement>) => {
  const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
  return {
    x: event.clientX - (rect?.left ?? 0),
    y: event.clientY - (rect?.top ?? 0),
  };
};

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
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [brazilStates, setBrazilStates] = useState<FeatureCollection<Geometry, BrazilStateProperties> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/maps/brazil-states.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Brazil states map failed to load");
        return response.json() as Promise<FeatureCollection<Geometry, BrazilStateProperties>>;
      })
      .then((geojson) => {
        if (!cancelled) setBrazilStates(geojson);
      })
      .catch(() => {
        if (!cancelled) setBrazilStates(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const countries = useMemo(
    () =>
      feature(
        worldTopology,
        worldTopology.objects.countries,
      ) as FeatureCollection<Geometry, CountryProperties>,
    [],
  );

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent([[18, 76], [882, 456]], { type: "Sphere" }),
    [],
  );

  const path = useMemo(() => geoPath(projection), [projection]);

  const bySlug = useMemo(() => new Map(territories.map((territory) => [territory.slug, territory])), [territories]);
  const cityTerritories = useMemo(
    () =>
      territories.filter(
        (territory) =>
          territory.type === "CITY" &&
          typeof territory.latitude === "number" &&
          typeof territory.longitude === "number",
      ),
    [territories],
  );

  const activeCountries = territories.filter((territory) => territory.type === "COUNTRY").length;
  const activeStates = territories.filter((territory) => territory.type === "STATE").length;
  const activeCities = cityTerritories.length;

  const showTerritoryTooltip = (event: MouseEvent<SVGElement>, territory: TerritorySummary) => {
    const position = getPointerPosition(event);
    setTooltip({
      ...position,
      title: territory.name,
      subtitle: `${territoryTypeLabel(territory.type)} · ${formatPoints(territory.totalPoints)} pts`,
    });
  };

  const showMapTooltip = (event: MouseEvent<SVGElement>, title: string, subtitle: string) => {
    const position = getPointerPosition(event);
    setTooltip({ ...position, title, subtitle });
  };

  const selectTerritory = (territory?: TerritorySummary) => {
    if (territory) onSelect(territory);
  };

  return (
    <div className="relative h-[58vh] min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 map-grid md:h-[calc(100vh-8.5rem)]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Mapa-múndi real</div>
          <div className="text-sm font-semibold text-zinc-100">Países, estados do Brasil e cidades disputáveis</div>
        </div>
        <div className="hidden rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 sm:block">
          {activeCountries} países · {activeStates} estados · {activeCities} cidades
        </div>
      </div>

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-full w-full pt-12"
        role="img"
        aria-label="Mapa-múndi competitivo com países, estados brasileiros e cidades"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="hsl(142 76% 45% / 0.14)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#mapGlow)" />
        <path d={path({ type: "Sphere" }) ?? undefined} fill="hsl(222 38% 4% / 0.64)" />

        <g transform={`translate(${MAP_CENTER.x * (1 - zoom)} ${MAP_CENTER.y * (1 - zoom)}) scale(${zoom})`}>
          {countries.features.map((country) => {
            const iso = String(country.id ?? "").padStart(3, "0");
            const territory = bySlug.get(countryIsoToSlug[iso]);
            const status = territory?.status ?? "NONE";
            const selected = territory ? selectedSlug === territory.slug : false;
            const countryName = territory?.name ?? country.properties?.name ?? "Território";
            const countryPath = path(country);

            if (!countryPath) return null;

            return (
              <path
                key={iso}
                d={countryPath}
                fill={territory ? statusToColor(status) : "hsl(222 13% 24%)"}
                fillOpacity={territory ? (selected ? 0.86 : 0.58) : 0.32}
                stroke={selected ? "white" : territory ? statusToColor(status) : "hsl(222 12% 34% / 0.75)"}
                strokeWidth={selected ? 1.7 : 0.58}
                className={statusClassName(status, Boolean(territory))}
                role={territory ? "button" : "img"}
                aria-label={`${countryName} - ${territory ? territoryTypeLabel(territory.type) : "país sem disputa ativa"}`}
                tabIndex={territory ? 0 : -1}
                onClick={() => selectTerritory(territory)}
                onKeyDown={(event) => {
                  if (territory && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    selectTerritory(territory);
                  }
                }}
                onMouseMove={(event) =>
                  territory
                    ? showTerritoryTooltip(event, territory)
                    : showMapTooltip(event, countryName, "País sem território ativo")
                }
              />
            );
          })}

          {brazilStates?.features.map((state) => {
            const slug = state.properties?.slug ?? undefined;
            const territory = slug ? bySlug.get(slug) : undefined;
            const status = territory?.status ?? "NONE";
            const selected = territory ? selectedSlug === territory.slug : false;
            const statePath = path(state as Feature<Geometry, BrazilStateProperties>);
            const stateName = territory?.name ?? state.properties?.name ?? "Estado";
            const uf = state.properties?.uf ? `, ${state.properties.uf}` : "";

            if (!statePath) return null;

            return (
              <path
                key={state.properties?.codarea ?? stateName}
                d={statePath}
                fill={territory ? statusToColor(status) : "hsl(222 11% 28%)"}
                fillOpacity={territory ? (selected ? 0.92 : 0.7) : 0.44}
                stroke={selected ? "white" : territory ? "hsl(0 0% 100% / 0.55)" : "hsl(0 0% 100% / 0.22)"}
                strokeWidth={selected ? 1.35 : territory ? 0.72 : 0.52}
                className={statusClassName(status, Boolean(territory))}
                role={territory ? "button" : "img"}
                aria-label={`${stateName}${uf} - ${territory ? territoryTypeLabel(territory.type) : "estado sem disputa ativa"}`}
                tabIndex={territory ? 0 : -1}
                onClick={() => selectTerritory(territory)}
                onKeyDown={(event) => {
                  if (territory && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    selectTerritory(territory);
                  }
                }}
                onMouseMove={(event) =>
                  territory
                    ? showTerritoryTooltip(event, territory)
                    : showMapTooltip(event, `${stateName}${uf}`, "Estado brasileiro sem disputa ativa")
                }
              />
            );
          })}

          {cityTerritories.map((territory) => {
            const point = projection([territory.longitude ?? 0, territory.latitude ?? 0]);
            if (!point) return null;

            const [x, y] = point;
            const selected = selectedSlug === territory.slug;
            const color = statusToColor(territory.status);
            const radius = selected ? 6.8 : territory.status === "WAR" ? 5.8 : 4.8;

            return (
              <g key={territory.id}>
                {territory.status === "WAR" ? (
                  <circle cx={x} cy={y} r={12} fill="none" stroke={color} strokeOpacity="0.36" strokeWidth="1.6" />
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  fillOpacity={selected ? 0.96 : 0.82}
                  stroke={selected ? "white" : "hsl(0 0% 100% / 0.72)"}
                  strokeWidth={selected ? 2.4 : 1.35}
                  className={statusClassName(territory.status, true)}
                  role="button"
                  aria-label={`${territory.name} - ${territoryTypeLabel(territory.type)}`}
                  tabIndex={0}
                  onClick={() => onSelect(territory)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(territory);
                    }
                  }}
                  onMouseMove={(event) => showTerritoryTooltip(event, territory)}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 left-4 z-20 hidden max-w-[18rem] rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-400 shadow-xl backdrop-blur sm:block">
        Clique nos países destacados, nos estados brasileiros ou nos pontos das cidades para abrir a disputa.
      </div>
      <MapControls
        onZoomIn={() => setZoom((value) => Math.min(2.1, Number((value + 0.2).toFixed(1))))}
        onZoomOut={() => setZoom((value) => Math.max(0.85, Number((value - 0.2).toFixed(1))))}
      />
      {tooltip ? <TerritoryTooltip {...tooltip} /> : null}
    </div>
  );
}
