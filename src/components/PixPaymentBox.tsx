"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatPoints } from "@/lib/format";
import type { PaymentStatus } from "@/types/domain";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";

export function PixPaymentBox({
  status,
  amountCents,
  points,
  pixQrCodeBase64,
  pixCopyPaste,
}: {
  status: PaymentStatus;
  amountCents: number;
  points: number;
  pixQrCodeBase64: string | null;
  pixCopyPaste: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!pixCopyPaste) return;
    await navigator.clipboard.writeText(pixCopyPaste);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="metric-label">Pix</div>
          <h1 className="mt-1 text-2xl font-black text-white">{formatCurrency(amountCents)}</h1>
          <p className="text-sm text-zinc-400">{formatPoints(points)} pontos na confirmação</p>
        </div>
        <PaymentStatusBadge status={status} />
      </div>

      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <div className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-white p-4">
          {pixQrCodeBase64 ? (
            <img src={`data:image/png;base64,${pixQrCodeBase64}`} alt="QR Code Pix" className="h-full w-full object-contain" />
          ) : (
            <div className="text-center text-sm font-bold text-zinc-950">QR Code disponível quando o Mercado Pago retornar a imagem.</div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-zinc-200">Código Pix copia e cola</label>
          <textarea
            readOnly
            value={pixCopyPaste ?? ""}
            className="h-40 w-full resize-none rounded-lg border border-white/10 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar código Pix"}
          </button>
          <p className="text-sm text-zinc-500">A página consulta o status automaticamente até o pagamento ser aprovado.</p>
        </div>
      </div>
    </div>
  );
}
