import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { setAdminCookie, verifyAdminPassword } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`admin:login:${ip}`, 5, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    await getPrisma().auditLog.create({
      data: { action: "admin.login_failed", actor: ip },
    }).catch(() => undefined);
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }

  await setAdminCookie();
  await getPrisma().auditLog.create({
    data: { action: "admin.login_success", actor: ip },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
