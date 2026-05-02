"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { RankingCard } from "@/components/RankingCards";
import type { RankingRow, RankingScope } from "@/types/domain";

const scopes: Array<[RankingScope, string]> = [
  ["global", "Global"],
  ["country", "País"],
  ["state", "Estado"],
  ["city", "Cidade"],
];

export function RankingTabs() {
  const [scope, setScope] = useState<RankingScope>("global");
  const [country, setCountry] = useState("Brasil");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ scope });
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    if (search) params.set("search", search);

    setLoading(true);
    fetch(`/api/rankings?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { rows?: RankingRow[] }) => setRows(data.rows ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [scope, country, state, city, search]);

  return (
    <section className="space-y-5">
      <div className="panel rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {scopes.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${scope === value ? "bg-emerald-400 text-zinc-950" : "border border-white/10 text-zinc-300 hover:border-emerald-300/40"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="País"
            className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-300/60"
          />
          <input
            value={state}
            onChange={(event) => setState(event.target.value)}
            placeholder="Estado"
            className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-300/60"
          />
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Cidade"
            className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-300/60"
          />
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm focus-within:border-emerald-300/60">
            <Search className="size-4 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou território"
              className="w-full bg-transparent outline-none"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 p-10 text-center text-zinc-500">Atualizando ranking...</div>
      ) : (
        <RankingCard rows={rows} />
      )}
    </section>
  );
}
