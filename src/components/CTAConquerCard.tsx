import { ArrowUpRight, Crown } from "lucide-react";
import Link from "next/link";

export function CTAConquerCard() {
  return (
    <section className="soft-card overflow-hidden p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-400 text-zinc-950">
          <Crown className="size-5" />
        </span>
        <div>
          <h3 className="font-black text-white">Começar disputa</h3>
          <p className="mt-1 text-sm text-zinc-400">Domine sua cidade antes que alguém tome.</p>
        </div>
      </div>
      <Link
        href="/checkout"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300"
      >
        Tomar território <ArrowUpRight className="size-4" />
      </Link>
    </section>
  );
}
