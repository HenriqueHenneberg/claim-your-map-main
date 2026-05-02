import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const users = await getPrisma().user.findMany({
    orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
    take: 100,
  });

  return NextResponse.json({ users: users.map(serializeUser) });
}
