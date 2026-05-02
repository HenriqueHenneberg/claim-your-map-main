import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { adminPatchUserSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminPatchUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data: { isBanned?: boolean; message?: null } = {};
  if (typeof parsed.data.isBanned === "boolean") data.isBanned = parsed.data.isBanned;
  if (parsed.data.hideMessage) data.message = null;

  const prisma = getPrisma();
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      action: "admin.user_updated",
      actor: "admin",
      metadata: { userId: id, ...parsed.data },
    },
  });

  return NextResponse.json({ user: serializeUser(user) });
}
