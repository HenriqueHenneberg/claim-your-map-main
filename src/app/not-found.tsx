import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-32 text-center">
      <div className="ownmap-panel rounded-2xl p-8">
        <h1 className="text-3xl font-black text-white">Territorio nao encontrado</h1>
        <p className="mt-2 text-slate-400">Esse ponto ainda nao apareceu no radar da OwnMap.</p>
        <Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-100">
          Voltar ao mapa
        </Link>
      </div>
    </div>
  );
}
