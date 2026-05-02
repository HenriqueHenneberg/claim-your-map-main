import Image from "next/image";
import Link from "next/link";
import { Crosshair, Radio, Search, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2">
      <div className="ownmap-glass flex items-center justify-between px-3 py-2 md:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/35 bg-black">
            <Image src="/ownmap-logo.svg" alt="OwnMap" width={44} height={44} priority className="size-11 object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-white">OwnMap</span>
            <span className="hidden text-xs text-slate-500 sm:block">Domine o mapa, deixe sua marca.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="/#explorar" className="hover:text-amber-200">Explorar</a>
          <Link href="/rankings" className="hover:text-amber-200">Rankings</Link>
          <a href="/#comunidade" className="hover:text-amber-200">Comunidade</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 lg:flex">
            <Radio className="size-3.5" />
            <span>12.8k explorando</span>
          </div>
          <a
            href="/#explorar"
            className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-slate-100 hover:bg-white/10 sm:inline-flex"
          >
            <Search className="size-4" />
            Buscar
          </a>
          <a
            href="/#explorar"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/10 hover:bg-amber-100"
          >
            <Crosshair className="size-4" />
            <span className="hidden sm:inline">Escolher territorio</span>
          </a>
          <UserCircle className="size-9 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
