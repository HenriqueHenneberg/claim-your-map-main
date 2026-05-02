import { Crown, Radio, ShieldCheck, Trophy, UserCircle } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2">
      <div className="panel flex items-center justify-between rounded-lg px-3 py-2 md:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/15 text-amber-200">
            <Crown className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase text-white">Compre o Topo</span>
            <span className="hidden text-xs text-zinc-500 sm:block">Pague pouco. Domine mais.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/rankings" className="hover:text-emerald-300">Rankings</Link>
          <a href="/#como-funciona" className="hover:text-emerald-300">Como funciona</a>
          <a href="/#comunidade" className="hover:text-emerald-300">Comunidade</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 lg:flex">
            <Radio className="size-3.5" />
            <span>1.248 online</span>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 sm:flex">
            <ShieldCheck className="size-3.5 text-emerald-300" />
            <span>Sistema ativo</span>
          </div>
          <Link
            href="/checkout"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-400 px-3 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-300"
          >
            <Trophy className="size-4" />
            <span className="hidden sm:inline">Tomar território</span>
          </Link>
          <UserCircle className="size-9 text-zinc-400" />
        </div>
      </div>
    </header>
  );
}
