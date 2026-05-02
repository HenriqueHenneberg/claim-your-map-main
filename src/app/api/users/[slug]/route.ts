import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Params) {
  const { slug } = await context.params;
  const profile = await getUserProfile(slug);
  if (!profile) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  return NextResponse.json(profile);
}
