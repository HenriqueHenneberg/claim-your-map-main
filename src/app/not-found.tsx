import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-32 text-center">
      <div className="panel rounded-lg p-8">
        <h1 className="text-3xl font-black text-white">Página não encontrada</h1>
        <p className="mt-2 text-zinc-400">Esse território ainda não entrou na disputa.</p>
        <Link href="/" className="mt-5 inline-flex rounded-lg bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300">
          Voltar ao mapa
        </Link>
      </div>
    </div>
  );
}
