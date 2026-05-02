import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getPaymentStatus } from "@/lib/payments/mercadopago";
import { updatePaymentFromProvider } from "@/lib/payments/settlement";
import { serializeTerritory, serializeUser } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Params) {
  const { id } = await context.params;
  const prisma = getPrisma();
  let payment = await prisma.payment.findUnique({
    where: { id },
    include: { user: true, territory: { include: { owner: true } } },
  });

  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }

  if (payment.status === PaymentStatus.PENDING && payment.providerPaymentId) {
    try {
      const provider = await getPaymentStatus(payment.providerPaymentId);
      await updatePaymentFromProvider(payment.id, provider.status);
      payment = await prisma.payment.findUnique({
        where: { id },
        include: { user: true, territory: { include: { owner: true } } },
      });
    } catch {
      // Keep the local pending state if the provider is temporarily unavailable.
    }
  }

  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    id: payment.id,
    providerPaymentId: payment.providerPaymentId,
    amountCents: payment.amountCents,
    points: payment.points,
    status: payment.status,
    pixQrCode: payment.pixQrCode,
    pixQrCodeBase64: payment.pixQrCodeBase64,
    pixCopyPaste: payment.pixCopyPaste,
    approvedAt: payment.approvedAt?.toISOString() ?? null,
    user: serializeUser(payment.user),
    territory: serializeTerritory(payment.territory),
  });
}
