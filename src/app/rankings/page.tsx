import { RankingTabs } from "@/components/RankingTabs";

export const dynamic = "force-dynamic";

export default function RankingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <div className="mb-6">
        <div className="metric-label">Rankings</div>
        <h1 className="mt-2 text-4xl font-black text-white">Quem está no topo agora</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">Global, país, estado e cidade. Empate favorece quem chegou primeiro.</p>
      </div>
      <RankingTabs />
    </div>
  );
}
