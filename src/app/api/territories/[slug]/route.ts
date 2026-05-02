import { NextResponse } from "next/server";
import { getTerritoryDetail } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Params) {
  const { slug } = await context.params;
  const detail = await getTerritoryDetail(slug);
  if (!detail) {
    return NextResponse.json({ error: "Território não encontrado." }, { status: 404 });
  }
  return NextResponse.json(detail);
}
