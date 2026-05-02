import { Activity } from "lucide-react";
import Link from "next/link";
import { compactDate } from "@/lib/format";
import type { RankEventSummary } from "@/types/domain";

export function BattleFeed({ events }: { events: RankEventSummary[] }) {
  return (
    <section className="soft-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="size-4 text-emerald-300" />
        <h3 className="font-bold text-white">Feed de eventos recentes</h3>
      </div>
      <div className="max-h-80 space-y-2 overflow-auto pr-1">
        {events.map((event) => (
          <Link
            key={event.id}
            href={event.territory ? `/territory/${event.territory.slug}` : "/rankings"}
            className="block rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:border-emerald-300/40"
          >
            <p className="text-sm text-zinc-200">{event.text}</p>
            <p className="mt-1 text-xs text-zinc-500">{compactDate(event.createdAt)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
