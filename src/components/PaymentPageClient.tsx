"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PixPaymentBox } from "@/components/PixPaymentBox";
import type { PaymentStatus, TerritorySummary } from "@/types/domain";

type PaymentData = {
  id: string;
  amountCents: number;
  points: number;
  status: PaymentStatus;
  pixQrCodeBase64: string | null;
  pixCopyPaste: string | null;
  territory: TerritorySummary;
};

export function PaymentPageClient({ paymentId }: { paymentId: string }) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await fetch(`/api/payments/${paymentId}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (cancelled) return;
      if (!response.ok) {
        setError(data.error ?? "Pagamento não encontrado.");
        return;
      }
      setPayment(data);
    };

    load();
    const interval = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [paymentId]);

  if (error) {
    return <div className="panel rounded-lg p-6 text-orange-100">{error}</div>;
  }

  if (!payment) {
    return <div className="panel rounded-lg p-6 text-zinc-400">Carregando Pix...</div>;
  }

  return (
    <div className="space-y-5">
      <PixPaymentBox
        status={payment.status}
        amountCents={payment.amountCents}
        points={payment.points}
        pixQrCodeBase64={payment.pixQrCodeBase64}
        pixCopyPaste={payment.pixCopyPaste}
      />
      {payment.status === "APPROVED" ? (
        <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-5 text-emerald-100">
          Pagamento aprovado. Ranking atualizado em {payment.territory.name}.
          <Link href={`/territory/${payment.territory.slug}`} className="ml-2 font-bold underline">Ver território</Link>
        </div>
      ) : null}
    </div>
  );
}
