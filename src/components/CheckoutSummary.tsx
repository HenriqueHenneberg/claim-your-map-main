import { formatCurrency, formatPoints } from "@/lib/format";
import type { TerritorySummary } from "@/types/domain";

export function CheckoutSummary({
  territory,
  amountCents,
}: {
  territory: TerritorySummary | null;
  amountCents: number;
}) {
  return (
    <aside className="panel rounded-lg p-5">
      <div className="metric-label">Resumo</div>
      <h2 className="mt-2 text-2xl font-black text-white">{territory?.name ?? "Escolha um território"}</h2>
      <div className="mt-4 grid gap-3">
        <div className="soft-card p-3">
          <div className="text-xs text-zinc-500">Valor Pix</div>
          <div className="text-xl font-black text-emerald-300">{formatCurrency(amountCents)}</div>
        </div>
        <div className="soft-card p-3">
          <div className="text-xs text-zinc-500">Pontos creditados após confirmação</div>
          <div className="text-xl font-black text-amber-200">{formatPoints(amountCents)} pts</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        O pagamento só muda rankings quando o Mercado Pago confirmar o Pix aprovado via webhook ou consulta de status.
      </p>
    </aside>
  );
}
