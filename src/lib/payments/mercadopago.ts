import { PaymentStatus } from "@prisma/client";
import type { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { hmacSha256, timingSafeEqualString } from "@/lib/security";
import { approvePaymentOnce, updatePaymentFromProvider } from "@/lib/payments/settlement";

type PixPaymentInput = {
  paymentId: string;
  amountCents: number;
  description: string;
  payerName: string;
  payerEmail?: string;
  notificationUrl: string;
};

type MercadoPagoPaymentResponse = {
  id?: number | string;
  status?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

export function mapPaymentStatus(status?: string | null): PaymentStatus {
  const normalized = status?.toLowerCase();
  if (normalized === "approved" || normalized === "accredited") return PaymentStatus.APPROVED;
  if (normalized === "cancelled" || normalized === "canceled") return PaymentStatus.CANCELLED;
  if (normalized === "rejected") return PaymentStatus.REJECTED;
  if (normalized === "refunded" || normalized === "charged_back") return PaymentStatus.REFUNDED;
  return PaymentStatus.PENDING;
}

export async function createPixPayment(input: PixPaymentInput) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    const devCode = `DEV-PIX-COMPRE-O-TOPO-${input.paymentId}-${input.amountCents}`;
    return {
      providerPaymentId: `dev_${input.paymentId}`,
      status: PaymentStatus.PENDING,
      pixQrCode: devCode,
      pixQrCodeBase64: null,
      pixCopyPaste: devCode,
      raw: { mode: "development", message: "Configure MERCADOPAGO_ACCESS_TOKEN to create real Pix charges." },
    };
  }

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.paymentId,
    },
    body: JSON.stringify({
      transaction_amount: input.amountCents / 100,
      description: input.description,
      payment_method_id: "pix",
      external_reference: input.paymentId,
      notification_url: input.notificationUrl,
      payer: {
        email: input.payerEmail ?? `${input.paymentId}@compreotopo.local`,
        first_name: input.payerName,
      },
    }),
  });

  const json = (await response.json().catch(() => ({}))) as MercadoPagoPaymentResponse & {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(json.message ?? json.error ?? "Mercado Pago rejected Pix creation.");
  }

  const transactionData = json.point_of_interaction?.transaction_data;

  return {
    providerPaymentId: String(json.id),
    status: mapPaymentStatus(json.status),
    pixQrCode: transactionData?.qr_code ?? null,
    pixQrCodeBase64: transactionData?.qr_code_base64 ?? null,
    pixCopyPaste: transactionData?.qr_code ?? null,
    raw: json,
  };
}

export async function getPaymentStatus(providerPaymentId: string) {
  if (providerPaymentId.startsWith("dev_")) {
    return { status: PaymentStatus.PENDING, raw: { mode: "development" } };
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${providerPaymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({}))) as MercadoPagoPaymentResponse & {
    status?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to fetch Mercado Pago payment status.");
  }

  return { status: mapPaymentStatus(json.status), raw: json };
}

export function validateMercadoPagoSignature(request: NextRequest, paymentId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const url = new URL(request.url);

  if (secret && url.searchParams.get("secret") === secret) {
    return true;
  }

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );

  const timestamp = parts.ts;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${timestamp};`;
  const expected = hmacSha256(secret, manifest);
  return timingSafeEqualString(signature, expected);
}

export async function handleMercadoPagoWebhook(request: NextRequest) {
  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    action?: string;
    data?: { id?: string | number };
    id?: string | number;
  };

  const providerPaymentId =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    (body.data?.id ? String(body.data.id) : null) ??
    (body.id ? String(body.id) : null);

  if (!providerPaymentId) {
    return { ok: false, status: 400, message: "Missing Mercado Pago payment id." };
  }

  if (!validateMercadoPagoSignature(request, providerPaymentId)) {
    return { ok: false, status: 401, message: "Invalid Mercado Pago signature." };
  }

  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
  });

  if (!payment) {
    await prisma.auditLog.create({
      data: {
        action: "webhook.payment_not_found",
        actor: "mercadopago",
        metadata: { providerPaymentId, body },
      },
    });
    return { ok: true, status: 200, message: "Payment not found locally; webhook acknowledged." };
  }

  const providerStatus = await getPaymentStatus(providerPaymentId);
  const result =
    providerStatus.status === PaymentStatus.APPROVED
      ? await approvePaymentOnce(payment.id)
      : await updatePaymentFromProvider(payment.id, providerStatus.status);

  return { ok: true, status: 200, message: "Webhook processed.", result };
}
