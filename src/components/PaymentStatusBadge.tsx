import { statusClass } from "@/lib/format";
import type { PaymentStatus } from "@/types/domain";

const labels: Record<PaymentStatus, string> = {
  PENDING: "Aguardando pagamento",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const visual = status === "APPROVED" ? "DOMINATED" : status === "PENDING" ? "ACTIVE" : "WAR";
  return (
    <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${statusClass(visual)}`}>
      {labels[status]}
    </span>
  );
}
