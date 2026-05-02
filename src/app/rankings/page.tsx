import Link from "next/link";
import { Crown, Search, Swords, Trophy } from "lucide-react";
import {
  formatOwnMapPoints,
  getOwnMapTerritoriesForStaticPages,
  statusLabels,
  titleForOwnMapTerritory,
  type OwnMapTerritory,
} from "@/lib/ownmap-data";

type Row = {
  name: string;
  avatarUrl: string;
  points: number;
  territory: OwnMapTerritory;
  title: string;
};

function buildRows(scope: OwnMapTerritory["type"] | "global") {
  const territories = getOwnMapTerritoriesForStaticPages().filter((territory) =>
    scope === "global" ? territory.ranking.length > 0 : territory.type === scope && territory.ranking.length > 0,
  );
  const rows = new Map<string, Row>();

  territories.forEach((territory) => {
    territory.ranking.forEach((rank, index) => {
      const current = rows.get(rank.name);
      const points = rank.points + Math.max(0, territory.points - index * 1400);
      if (!current || points > current.points) {
        rows.set(rank.name, {
          name: rank.name,
          avatarUrl: rank.avatarUrl,
          points,
          territory,
          title: index === 0 ? titleForOwnMapTerritory(territory) : "Desafiante",
        });
      }
    });
  });

  return Array.from(rows.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 12);
}

function RankingSection({ title, description, rows }: { title: string; description: string; rows: Row[] }) {
  const [first, second, third, ...rest] = rows;
  const podium = [second, first, third].filter(Boolean);

  return (
    <section className="ownmap-section rounded-3xl border border-white/10 bg-white/[0.035] p-4 md:p-5">
      <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <div className="ownmap-eyebrow">Ranking</div>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <Swords className="size-5 text-orange-300" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {podium.map((row, index) => (
          <Link
            key={`${row.name}-${row.territory.slug}`}
            href={`/?territory=${row.territory.slug}`}
            className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
              index === 1 ? "border-amber-300/40 bg-amber-300/[0.12] md:-mt-3" : "border-white/10 bg-slate-950/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <img src={row.avatarUrl} alt="" className="size-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {index === 1 ? <Crown className="size-4 text-amber-300" /> : <Trophy className="size-4 text-slate-500" />}
                  <span className="text-xs font-black text-slate-400">#{index === 1 ? 1 : index === 0 ? 2 : 3}</span>
                </div>
                <div className="truncate text-lg font-black text-white">{row.name}</div>
                <div className="truncate text-xs text-slate-500">{row.title}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-emerald-200">{formatOwnMapPoints(row.points)} pts</span>
              <span className="text-slate-500">{row.territory.name}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 divide-y divide-white/[0.08] overflow-hidden rounded-2xl border border-white/10">
        {rest.map((row, index) => (
          <Link
            key={`${row.name}-${row.territory.slug}-${index}`}
            href={`/?territory=${row.territory.slug}`}
            className="grid gap-3 bg-slate-950/35 p-3 transition hover:bg-white/[0.06] md:grid-cols-[54px_1fr_150px_150px]"
          >
            <span className="text-xl font-black text-slate-500">#{index + 4}</span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-white">{row.name}</span>
              <span className="block truncate text-xs text-slate-500">{row.title}</span>
            </span>
            <span className="text-sm font-bold text-emerald-200">{formatOwnMapPoints(row.points)} pts</span>
            <span className="text-sm text-slate-400">faltam {formatOwnMapPoints(Math.max(100, rows[index + 2]?.points - row.points || 400))} pts</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function RankingsPage() {
  const globalRows = buildRows("global");
  const countryRows = buildRows("country");
  const stateRows = buildRows("state");
  const cityRows = buildRows("city");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="ownmap-eyebrow">OwnMap rankings</div>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Quem manda no mapa agora</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Compare lideres globais, paises, estados e cidades. Cada linha aponta para um territorio que pode ser explorado no mapa.
          </p>
        </div>
        <a
          href="/#explorar"
          className="ownmap-glass flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"
        >
          <Search className="size-4 text-amber-300" />
          Buscar um territorio no mapa
        </a>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Global", "Paises", "Estados", "Cidades", "Em guerra", "Baratos"].map((filter) => (
          <span key={filter} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">
            {filter}
          </span>
        ))}
      </div>

      <div className="grid gap-5">
        <RankingSection title="Global" description="Soma simbolica dos melhores desempenhos em todos os territorios." rows={globalRows} />
        <RankingSection title="Paises" description="Presidentes e donos nacionais que mais chamam atencao." rows={countryRows} />
        <RankingSection title="Estados" description="Governadores estaduais e guerras regionais no Brasil." rows={stateRows} />
        <RankingSection title="Cidades" description="Prefeitos locais, microvitorias e oportunidades baratas." rows={cityRows} />
      </div>

      <section className="mt-6 grid gap-3 rounded-3xl border border-orange-400/20 bg-orange-400/10 p-5 text-orange-100 md:grid-cols-3">
        {getOwnMapTerritoriesForStaticPages()
          .filter((territory) => territory.status === "war")
          .slice(0, 3)
          .map((territory) => (
            <Link key={territory.slug} href={`/?territory=${territory.slug}`} className="rounded-2xl border border-orange-300/20 bg-black/20 p-4 hover:bg-black/35">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-orange-200">{statusLabels[territory.status]}</div>
              <div className="mt-2 text-lg font-black text-white">{territory.name}</div>
              <div className="mt-1 text-sm text-orange-100/80">faltam {formatOwnMapPoints(territory.gapPoints)} pontos para virar.</div>
            </Link>
          ))}
      </section>
    </div>
  );
}
