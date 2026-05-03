import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, MapPin, Palette, Sparkles, Swords, Trophy } from "lucide-react";
import {
  formatOwnMapCurrency,
  formatOwnMapPoints,
  getExpandedRanking,
  getOwnMapTerritoriesForStaticPages,
  getOwnMapTerritoryBySlug,
  statusLabels,
  titleForOwnMapTerritory,
  typeLabels,
} from "@/lib/ownmap-data";
import { territoryVisualStyle } from "@/lib/ownmap-visuals";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TerritoryPage({ params }: Props) {
  const { slug } = await params;
  const territory = getOwnMapTerritoryBySlug(slug);
  if (!territory) notFound();

  const allTerritories = getOwnMapTerritoriesForStaticPages();
  const ranking = getExpandedRanking(territory, 100);
  const topThree = ranking.slice(0, 3);
  const topTen = ranking.slice(3, 10);
  const nearby = allTerritories
    .filter((item) => item.slug !== territory.slug && (item.country === territory.country || item.state === territory.state))
    .sort((a, b) => a.gapPoints - b.gapPoints)
    .slice(0, 4);
  const histories = [
    `${territory.owner?.name ?? "Um desafiante"} assumiu a lideranca de ${territory.name}.`,
    `${territory.name} entrou no modo ${statusLabels[territory.status].toLowerCase()}.`,
    `A personalizacao do territorio foi atualizada com novo banner.`,
  ];
  const accent = territory.owner?.accent ?? "#d4a736";
  const markerLeft = territory.longitude ? `${Math.min(92, Math.max(8, ((territory.longitude + 180) / 360) * 100))}%` : "52%";
  const markerTop = territory.latitude ? `${Math.min(86, Math.max(12, ((90 - territory.latitude) / 180) * 100))}%` : "48%";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30">
        <div className="grid min-h-[520px] lg:grid-cols-[1fr_420px]">
          <div className="relative min-h-[430px] bg-cover bg-center" style={territoryVisualStyle(territory)}>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/52 to-slate-950/20" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <div className="mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em]" style={{ borderColor: `${accent}80`, color: accent }}>
                {typeLabels[territory.type]} - {statusLabels[territory.status]}
              </div>
              <h1 className="max-w-3xl text-5xl font-black text-white md:text-7xl">{territory.name}</h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-300">
                {[territory.city, territory.state, territory.country].filter(Boolean).join(", ")}
              </p>
              <p className="mt-4 max-w-xl rounded-2xl border border-white/10 bg-black/35 p-4 text-slate-100 backdrop-blur">
                "{territory.owner?.message ?? "Este territorio ainda esta esperando alguem deixar uma marca."}"
              </p>
            </div>
          </div>

          <aside className="grid gap-4 border-t border-white/10 bg-slate-950/[0.86] p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                {territory.owner?.avatarUrl ? (
                  <img src={territory.owner.avatarUrl} alt="" className="size-14 rounded-2xl object-cover ring-2 ring-white/10" />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 font-black text-white">?</span>
                )}
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Dono atual</div>
                  <div className="truncate text-xl font-black text-white">{territory.owner?.name ?? "Sem dono"}</div>
                  <div className="truncate text-sm text-slate-400">
                    {territory.owner?.title ?? titleForOwnMapTerritory(territory)}
                    {territory.owner?.customTitle ? ` - ${territory.owner.customTitle}` : ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric label="Pontos" value={formatOwnMapPoints(territory.points)} />
              <Metric label="Dono" value={formatOwnMapPoints(territory.ownerPoints)} />
              <Metric label="Valor" value={formatOwnMapCurrency(territory.totalCents)} />
            </div>

            <div className="rounded-2xl border border-orange-300/25 bg-orange-400/10 p-4 text-orange-100">
              <Swords className="mr-2 inline size-4" />
              Faltam so {formatOwnMapPoints(territory.gapPoints)} pontos para tomar {territory.name}.
              <span className="mt-1 block text-sm text-orange-100/75">
                Voce esta a {formatOwnMapCurrency(territory.gapPoints)} de virar {titleForOwnMapTerritory(territory).split(" de ")[0]}.
              </span>
            </div>

            <Link
              href={`/?territory=${territory.slug}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 hover:bg-amber-100"
            >
              <MapPin className="size-4" />
              {territory.status === "empty" ? "Ser o primeiro dono" : "Abrir no mapa e disputar"}
            </Link>
          </aside>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Mapa aproximado</h2>
              <span className="text-xs font-bold text-slate-500">camada {typeLabels[territory.type].toLowerCase()}</span>
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#071017]">
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute inset-8 rounded-[42%] border border-white/[0.12] bg-emerald-500/10" />
              <span className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-orange-400 shadow-[0_0_30px_rgba(251,146,60,.75)]" style={{ left: markerLeft, top: markerTop }} />
              <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300 backdrop-blur">
                {territory.name} destacado. Use a home para zoom real, arrastar e trocar camadas.
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h2 className="flex items-center gap-2 text-xl font-black text-white">
                <Crown className="size-5 text-amber-300" />
                Top 3 que mandam aqui
              </h2>
              <div className="flex gap-2">
                {["Top 10", "Top 50", "Top 100"].map((label) => (
                  <span key={label} className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-300">{label}</span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {topThree.map((rank, index) => (
                <div key={`${rank.name}-podium-${index}`} className={`rounded-2xl border p-4 ${index === 0 ? "border-amber-300/35 bg-amber-300/10" : "border-white/10 bg-slate-950/45"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-500">#{index + 1}</span>
                    <img src={rank.avatarUrl} alt="" className="size-11 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate font-black text-white">{rank.name}</span>
                      <span className="block truncate text-xs text-slate-500">{index === 0 ? titleForOwnMapTerritory(territory) : index === 1 ? "Vice-lider" : "Rival direto"}</span>
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-bold text-emerald-200">{formatOwnMapPoints(rank.points)} pts</div>
                  {index > 0 ? <div className="mt-1 text-xs text-slate-500">faltam {formatOwnMapCurrency(Math.max(100, topThree[index - 1].points - rank.points))} para passar</div> : null}
                </div>
              ))}
              {!topThree.length ? <p className="rounded-2xl border border-dashed border-white/10 p-4 text-slate-500">Disponivel para conquista. Seja o primeiro dono.</p> : null}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
              <Trophy className="size-5 text-amber-300" />
              Ranking local - Top 10
            </h2>
            <div className="space-y-2">
              {topTen.map((rank, index) => (
                <div key={`${rank.name}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3 md:grid-cols-[54px_1fr_140px]">
                  <span className="text-2xl font-black text-slate-500">#{index + 4}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <img src={rank.avatarUrl} alt="" className="size-10 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-white">{rank.name}</span>
                      <span className="block truncate text-xs text-slate-500">faltam {formatOwnMapCurrency(Math.max(100, ranking[index + 2].points - rank.points))} para passar</span>
                    </span>
                  </span>
                  <span className="text-sm font-bold text-emerald-200">{formatOwnMapPoints(rank.points)} pts</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 text-xl font-black text-white">Historico de dominio</h2>
            <div className="grid gap-2 md:grid-cols-3">
              {histories.map((event) => (
                <p key={event} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                  {event}
                </p>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
              <Palette className="size-5 text-amber-300" />
              Personalizacao
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="h-28 bg-cover bg-center" style={territoryVisualStyle(territory)} />
              <div className="bg-slate-950/75 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Emblema</div>
                <div className="mt-1 text-lg font-black text-white">{territory.owner?.emblem ?? "Primeira marca"}</div>
                <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: accent }} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
              <Sparkles className="size-5 text-amber-300" />
              Eventos recentes
            </h2>
            <div className="space-y-2">
              {territory.events.map((event) => (
                <p key={event} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-sm text-slate-300">
                  {event}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
              <Crown className="size-5 text-amber-300" />
              Perto daqui
            </h2>
            <div className="space-y-2">
              {nearby.map((item) => (
                <Link key={item.slug} href={`/territory/${item.slug}`} className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3 hover:bg-white/[0.06]">
                  <span className="block font-bold text-white">{item.name}</span>
                  <span className="text-xs text-slate-500">
                    {statusLabels[item.status]} - faltam {formatOwnMapPoints(item.gapPoints)} pts
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
    </div>
  );
}
