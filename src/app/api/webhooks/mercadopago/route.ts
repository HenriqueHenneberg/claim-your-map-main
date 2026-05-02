import { NextRequest, NextResponse } from "next/server";
import { handleMercadoPagoWebhook } from "@/lib/payments/mercadopago";

export async function POST(request: NextRequest) {
  const result = await handleMercadoPagoWebhook(request);
  return NextResponse.json(result, { status: result.status });
}
