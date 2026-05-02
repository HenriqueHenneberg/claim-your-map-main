"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckoutSummary } from "@/components/CheckoutSummary";
import type { TerritorySummary } from "@/types/domain";

const quickAmounts = [100, 200, 500, 1000, 2500];

export function CheckoutForm({ initialTerritorySlug }: { initialTerritorySlug?: string }) {
  const router = useRouter();
  const [territories, setTerritories] = useState<TerritorySummary[]>([]);
  const [territorySlug, setTerritorySlug] = useState(initialTerritorySlug ?? "");
  const [publicName, setPublicName] = useState("");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [state, setState] = useState("Paraná");
  const [city, setCity] = useState("Curitiba");
  const [amountCents, setAmountCents] = useState(500);
  const [customAmount, setCustomAmount] = useState("5,00");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/territories")
      .then((response) => response.json())
      .then((data: { territories?: TerritorySummary[] }) => {
        const list = data.territories ?? [];
        setTerritories(list);
        if (!territorySlug && list[0]) setTerritorySlug(list[0].slug);
      })
      .catch(() => setError("Não foi possível carregar territórios."));
  }, [territorySlug]);

  const selectedTerritory = useMemo(
    () => territories.find((territory) => territory.slug === territorySlug) ?? null,
    [territories, territorySlug],
  );

  useEffect(() => {
    if (!selectedTerritory) return;
    setCountry(selectedTerritory.country ?? "");
    setState(selectedTerritory.state ?? "");
    setCity(selectedTerritory.city ?? "");
  }, [selectedTerritory?.slug]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicName,
        message,
        country,
        state,
        city,
        territorySlug,
        amountCents,
      }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Não foi possível iniciar o checkout.");
      return;
    }

    router.push(`/payment/${data.id}`);
  };

  const updateCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numberValue = Number(value.replace(".", "").replace(",", "."));
    if (Number.isFinite(numberValue)) {
      setAmountCents(Math.max(100, Math.round(numberValue * 100)));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="panel rounded-lg p-5">
        <div className="mb-6">
          <div className="metric-label">Checkout Pix</div>
          <h1 className="mt-2 text-3xl font-black text-white">Tomar território</h1>
          <p className="mt-2 text-zinc-400">Cada R$1,00 vira 100 pontos. O backend calcula a pontuação final.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            Nome público
            <input value={publicName} onChange={(event) => setPublicName(event.target.value)} required maxLength={40} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 font-normal outline-none focus:border-emerald-300/60" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            Território alvo
            <select value={territorySlug} onChange={(event) => setTerritorySlug(event.target.value)} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 font-normal outline-none focus:border-emerald-300/60">
              {territories.map((territory) => (
                <option key={territory.id} value={territory.slug}>{territory.name} · {territory.type}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-200 md:col-span-2">
            Mensagem curta
            <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={80} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 font-normal outline-none focus:border-emerald-300/60" />
            <span className="text-xs font-normal text-zinc-500">{message.length}/80</span>
          </label>
          <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="País" className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 outline-none focus:border-emerald-300/60" />
          <input value={state} onChange={(event) => setState(event.target.value)} placeholder="Estado" className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 outline-none focus:border-emerald-300/60" />
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Cidade" className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 outline-none focus:border-emerald-300/60 md:col-span-2" />
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-bold text-zinc-200">Valor</div>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmountCents(value);
                  setCustomAmount((value / 100).toFixed(2).replace(".", ","));
                }}
                className={`rounded-lg px-4 py-2 text-sm font-black ${amountCents === value ? "bg-emerald-400 text-zinc-950" : "border border-white/10 text-zinc-300 hover:border-emerald-300/50"}`}
              >
                R${(value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </button>
            ))}
            <input
              value={customAmount}
              onChange={(event) => updateCustomAmount(event.target.value)}
              className="w-28 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-300/60"
              aria-label="Valor customizado em reais"
            />
          </div>
        </div>

        {error ? <div className="mt-4 rounded-lg border border-orange-400/30 bg-orange-400/10 p-3 text-sm text-orange-100">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-4 text-sm font-black text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Gerando Pix..." : "Gerar Pix e entrar na disputa"}
        </button>
      </form>

      <CheckoutSummary territory={selectedTerritory} amountCents={amountCents} />
    </div>
  );
}
