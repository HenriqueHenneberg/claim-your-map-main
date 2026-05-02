import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";
import { serializeTerritory, serializeUser } from "@/lib/serializers";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payments = await getPrisma().payment.findMany({
    include: { user: true, territory: { include: { owner: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    payments: payments.map((payment) => ({
      id: payment.id,
      providerPaymentId: payment.providerPaymentId,
      amountCents: payment.amountCents,
      points: payment.points,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      approvedAt: payment.approvedAt?.toISOString() ?? null,
      user: serializeUser(payment.user),
      territory: serializeTerritory(payment.territory),
    })),
  });
}
