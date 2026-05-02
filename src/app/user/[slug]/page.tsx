import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, MapPin, MessageSquare, Swords } from "lucide-react";
import {
  formatOwnMapCurrency,
  formatOwnMapPoints,
  getOwnMapTerritoriesForStaticPages,
  owners,
  slugifyOwnMap,
  titleForOwnMapTerritory,
} from "@/lib/ownmap-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function UserPage({ params }: Props) {
  const { slug } = await params;
  const owner = Object.values(owners).find((item) => slugifyOwnMap(item.name) === slug);
  if (!owner) notFound();

  const territories = getOwnMapTerritoriesForStaticPages();
  const owned = territories.filter((territory) => territory.owner?.name === owner.name);
  const events = territories
    .filter((territory) => territory.ranking.some((rank) => rank.name === owner.name) || territory.owner?.name === owner.name)
    .flatMap((territory) => territory.events.map((event) => ({ event, territory })))
    .slice(0, 8);
  const totalPoints = owned.reduce((sum, territory) => sum + territory.ownerPoints, 0);
  const totalCents = owned.reduce((sum, territory) => sum + territory.totalCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <section className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] lg:grid-cols-[380px_1fr]">
        <div className="bg-slate-950/76 p-6">
          <img src={owner.avatarUrl} alt="" className="size-28 rounded-3xl object-cover ring-2 ring-white/10" />
          <div className="mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em]" style={{ color: owner.accent, borderColor: `${owner.accent}80` }}>
            {owner.emblem}
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">{owner.name}</h1>
          <p className="mt-2 text-slate-400">{owner.title}</p>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-slate-100">"{owner.message}"</p>
          <Link href="/#explorar" className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 hover:bg-amber-100">
            <Swords className="size-4" />
            Ultrapassar este usuario
          </Link>
        </div>

        <div className="p-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Pontos totais" value={formatOwnMapPoints(totalPoints)} />
            <Metric label="Contribuicao" value={formatOwnMapCurrency(totalCents)} />
            <Metric label="Territorios" value={formatOwnMapPoints(owned.length)} />
            <Metric label="Posicao global" value="#1" />
          </div>

          <section className="mt-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
              <Crown className="size-5 text-amber-300" />
              Territorios dominados
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {owned.map((territory) => (
                <Link key={territory.slug} href={`/territory/${territory.slug}`} className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 hover:bg-amber-300/[0.14]">
                  <div className="font-black text-white">{territory.name}</div>
                  <div className="mt-1 text-sm text-amber-100">{titleForOwnMapTerritory(territory)}</div>
                  <div className="mt-3 text-xs text-slate-400">{formatOwnMapPoints(territory.ownerPoints)} pts no territorio</div>
                </Link>
              ))}
              {!owned.length ? <p className="text-slate-500">Este usuario ainda esta disputando o primeiro territorio.</p> : null}
            </div>
          </section>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
            <MapPin className="size-5 text-emerald-300" />
            Historico publico
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {events.map(({ event, territory }) => (
              <Link key={`${territory.slug}-${event}`} href={`/territory/${territory.slug}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 hover:bg-white/[0.06]">
                <span className="block text-sm text-slate-300">{event}</span>
                <span className="mt-2 block text-xs text-slate-500">{territory.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white">
            <MessageSquare className="size-5 text-amber-300" />
            Cartao social
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${owned[0]?.bannerUrl ?? "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80"})` }} />
            <div className="bg-slate-950/80 p-4">
              <div className="font-black text-white">{owner.name}</div>
              <div className="mt-1 text-sm text-slate-400">{owner.message}</div>
              <div className="mt-4 h-2 rounded-full" style={{ backgroundColor: owner.accent }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 truncate text-lg font-black text-white">{value}</div>
    </div>
  );
}
