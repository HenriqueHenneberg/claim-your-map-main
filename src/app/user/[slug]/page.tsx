import Link from "next/link";
import { notFound } from "next/navigation";
import { BattleFeed } from "@/components/BattleFeed";
import { ProfileCard } from "@/components/ProfileCard";
import { TerritoryHistory } from "@/components/TerritoryHistory";
import { UserStats } from "@/components/UserStats";
import { getUserProfile } from "@/lib/queries";
import { titleForTerritory } from "@/lib/territory-rules";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function UserPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getUserProfile(slug);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <ProfileCard user={profile.user} />
      <div className="mt-5">
        <UserStats positions={profile.positions} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="soft-card p-5">
            <h2 className="mb-4 text-xl font-black text-white">Títulos conquistados</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {profile.titles.map((title) => (
                <Link key={title.slug} href={`/territory/${title.slug}`} className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 hover:border-amber-200/60">
                  <div className="font-bold text-white">{titleForTerritory(title.type)}</div>
                  <div className="text-sm text-amber-100">{title.territory}</div>
                </Link>
              ))}
              {!profile.titles.length ? <p className="text-zinc-500">Nenhum território dominado ainda.</p> : null}
            </div>
          </section>
          <TerritoryHistory items={profile.territoryHistory} />
        </div>
        <div className="space-y-5">
          <Link href="/checkout" className="block rounded-lg bg-emerald-400 px-5 py-4 text-center text-sm font-black text-zinc-950 hover:bg-emerald-300">
            Ultrapassar este usuário
          </Link>
          <BattleFeed events={profile.events} />
        </div>
      </div>
    </div>
  );
}
