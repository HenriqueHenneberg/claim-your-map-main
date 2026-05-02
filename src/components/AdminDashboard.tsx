"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminStats } from "@/components/AdminStats";
import { AdminTable } from "@/components/AdminTable";
import { formatCurrency, formatPoints, statusLabel, territoryTypeLabel } from "@/lib/format";
import type { PublicUser, RankEventSummary, TerritorySummary } from "@/types/domain";

type PaymentRow = {
  id: string;
  providerPaymentId: string | null;
  status: string;
  amountCents: number;
  points: number;
  createdAt: string;
  user: PublicUser;
  territory: TerritorySummary;
};

type AdminData = {
  totals: {
    raised: number;
    pendingPayments: number;
    approvedPayments: number;
    activeUsers: number;
  };
  users: PublicUser[];
  payments: PaymentRow[];
  territories: TerritorySummary[];
  topTerritories: TerritorySummary[];
  warTerritories: TerritorySummary[];
  topPayers: PublicUser[];
  events: RankEventSummary[];
  logs: Array<{ id: string; action: string; actor: string | null; createdAt: string; metadata: unknown }>;
};

export function AdminDashboard({ data }: { data: AdminData }) {
  const router = useRouter();
  const [users, setUsers] = useState(data.users);

  const patchUser = async (id: string, body: { isBanned?: boolean; hideMessage?: boolean }) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.user) {
      setUsers((current) => current.map((user) => (user.id === id ? json.user : user)));
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="metric-label">Painel administrativo</div>
          <h1 className="mt-2 text-3xl font-black text-white">Operação OwnMap</h1>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10">
          <LogOut className="size-4" />
          Sair
        </button>
      </div>

      <AdminStats totals={data.totals} />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminTable title="Territórios mais lucrativos">
          <table className="w-full min-w-[520px] text-sm">
            <tbody>
              {data.topTerritories.map((territory) => (
                <tr key={territory.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-bold text-white">{territory.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{statusLabel(territory.status)}</td>
                  <td className="px-4 py-3 text-right text-emerald-300">{formatCurrency(territory.totalAmountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
        <AdminTable title="Guerras ativas">
          <table className="w-full min-w-[420px] text-sm">
            <tbody>
              {data.warTerritories.map((territory) => (
                <tr key={territory.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-bold text-white">{territory.name}</td>
                  <td className="px-4 py-3 text-orange-200">{formatPoints(territory.totalPoints)} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
        <AdminTable title="Top pagadores">
          <table className="w-full min-w-[420px] text-sm">
            <tbody>
              {data.topPayers.map((user) => (
                <tr key={user.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-bold text-white">{user.publicName}</td>
                  <td className="px-4 py-3 text-right text-emerald-300">{formatCurrency(user.totalPaidCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </div>

      <AdminTable title="Usuários">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Pontos</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-bold text-white">{user.publicName}</td>
                <td className="px-4 py-3 text-zinc-400">{[user.city, user.state, user.country].filter(Boolean).join(", ")}</td>
                <td className="px-4 py-3 text-emerald-300">{formatPoints(user.totalPoints)}</td>
                <td className="px-4 py-3 text-zinc-300">{formatCurrency(user.totalPaidCents)}</td>
                <td className="px-4 py-3">{user.isBanned ? "Banido" : "Ativo"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => patchUser(user.id, { isBanned: !user.isBanned })} className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10">
                      {user.isBanned ? "Desbanir" : "Banir"}
                    </button>
                    <button onClick={() => patchUser(user.id, { hideMessage: true })} className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10">
                      Ocultar mensagem
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>

      <AdminTable title="Pagamentos">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Território</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pontos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Provider</th>
            </tr>
          </thead>
          <tbody>
            {data.payments.map((payment) => (
              <tr key={payment.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{payment.id}</td>
                <td className="px-4 py-3 text-white">{payment.user.publicName}</td>
                <td className="px-4 py-3 text-zinc-300">{payment.territory.name}</td>
                <td className="px-4 py-3 text-emerald-300">{formatCurrency(payment.amountCents)}</td>
                <td className="px-4 py-3">{formatPoints(payment.points)}</td>
                <td className="px-4 py-3">{payment.status}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{payment.providerPaymentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>

      <AdminTable title="Territórios">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Dono</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pontos</th>
              <th className="px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.territories.map((territory) => (
              <tr key={territory.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-bold text-white">{territory.name}</td>
                <td className="px-4 py-3 text-zinc-400">{territoryTypeLabel(territory.type)}</td>
                <td className="px-4 py-3 text-zinc-300">{territory.owner?.publicName ?? "Sem dono"}</td>
                <td className="px-4 py-3">{statusLabel(territory.status)}</td>
                <td className="px-4 py-3 text-emerald-300">{formatPoints(territory.totalPoints)}</td>
                <td className="px-4 py-3">{formatCurrency(territory.totalAmountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminTable title="Últimos eventos">
          <div className="space-y-2 p-4">
            {data.events.map((event) => <p key={event.id} className="rounded-lg bg-white/[0.03] p-3 text-sm text-zinc-300">{event.text}</p>)}
          </div>
        </AdminTable>
        <AdminTable title="Logs recentes">
          <div className="space-y-2 p-4">
            {data.logs.map((log) => <p key={log.id} className="rounded-lg bg-white/[0.03] p-3 font-mono text-xs text-zinc-400">{log.action} · {log.actor ?? "system"}</p>)}
          </div>
        </AdminTable>
      </div>
    </div>
  );
}
