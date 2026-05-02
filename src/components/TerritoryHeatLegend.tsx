import type { TerritoryStatus } from "@/types/domain";

export function statusToColor(status: TerritoryStatus) {
  const colors: Record<TerritoryStatus, string> = {
    NONE: "hsl(222 12% 34%)",
    ACTIVE: "hsl(142 54% 39%)",
    COMPETITIVE: "hsl(142 82% 50%)",
    DOMINATED: "hsl(43 96% 56%)",
    WAR: "hsl(12 95% 56%)",
  };
  return colors[status];
}

const items: Array<[TerritoryStatus, string]> = [
  ["NONE", "Sem domínio"],
  ["ACTIVE", "Ativo"],
  ["COMPETITIVE", "Competitivo"],
  ["DOMINATED", "Dominado"],
  ["WAR", "Guerra ativa"],
];

export function TerritoryHeatLegend() {
  return (
    <div className="soft-card p-4">
      <div className="mb-3 text-sm font-semibold text-white">Legenda do mapa</div>
      <div className="grid gap-2 text-xs text-zinc-400">
        {items.map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: statusToColor(status), boxShadow: `0 0 14px ${statusToColor(status)}` }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">Quanto mais intensa a cor, maior a disputa.</p>
    </div>
  );
}
