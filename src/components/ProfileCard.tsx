import { Crown } from "lucide-react";
import { formatCurrency, formatPoints, initials, locationLabel } from "@/lib/format";
import type { PublicUser } from "@/types/domain";

export function ProfileCard({ user }: { user: PublicUser }) {
  return (
    <section className="panel rounded-lg p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex size-20 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-2xl font-black text-amber-100">
          {initials(user.publicName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black text-white">{user.publicName}</h1>
            <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
              <Crown className="mr-1 inline size-3" />
              Competidor
            </span>
          </div>
          <p className="mt-2 text-zinc-400">{user.message ?? "Alguém pode tomar seu lugar a qualquer momento."}</p>
          <p className="mt-1 text-sm text-zinc-500">{locationLabel(user)}</p>
        </div>
        <div className="grid gap-2 text-right">
          <div className="text-3xl font-black text-emerald-300">{formatPoints(user.totalPoints)}</div>
          <div className="text-sm text-zinc-500">{formatCurrency(user.totalPaidCents)} contribuídos</div>
        </div>
      </div>
    </section>
  );
}
