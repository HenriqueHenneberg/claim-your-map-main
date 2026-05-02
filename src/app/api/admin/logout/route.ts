import { NextResponse } from "next/server";
import { clearAdminCookie, isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

export async function POST() {
  const wasAuthenticated = await isAdminAuthenticated();
  await clearAdminCookie();

  if (wasAuthenticated) {
    await getPrisma().auditLog.create({
      data: { action: "admin.logout", actor: "admin" },
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
