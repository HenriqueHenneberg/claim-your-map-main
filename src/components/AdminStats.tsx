import { CreditCard, Hourglass, Users, Zap } from "lucide-react";
import { formatCurrency, formatPoints } from "@/lib/format";
import { StatsCard } from "@/components/StatsCard";

export function AdminStats({
  totals,
}: {
  totals: {
    raised: number;
    pendingPayments: number;
    approvedPayments: number;
    activeUsers: number;
  };
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <StatsCard label="Total arrecadado" value={formatCurrency(totals.raised)} icon={CreditCard} />
      <StatsCard label="Pendentes" value={formatPoints(totals.pendingPayments)} icon={Hourglass} />
      <StatsCard label="Aprovados" value={formatPoints(totals.approvedPayments)} icon={Zap} />
      <StatsCard label="Usuários ativos" value={formatPoints(totals.activeUsers)} icon={Users} />
    </div>
  );
}
