import { NextRequest, NextResponse } from "next/server";
import { getRanking } from "@/lib/rankings";
import { rankingQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = rankingQuerySchema.safeParse({
    scope: params.get("scope") ?? "global",
    country: params.get("country"),
    state: params.get("state"),
    city: params.get("city"),
    search: params.get("search"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
  }

  const ranking = await getRanking(parsed.data);
  return NextResponse.json(ranking);
}
