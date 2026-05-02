import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { amountCentsToPoints } from "@/lib/format";
import { createPixPayment } from "@/lib/payments/mercadopago";
import { updatePaymentFromProvider } from "@/lib/payments/settlement";
import { rateLimit } from "@/lib/rate-limit";
import { containsBannedWord, getBannedWords, sanitizeText } from "@/lib/security";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createPaymentSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`payment:create:${ip}`, 6, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createPaymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const publicName = sanitizeText(parsed.data.publicName, 40);
  const message = parsed.data.message ? sanitizeText(parsed.data.message, 80) : null;
  const country = sanitizeText(parsed.data.country, 60);
  const state = parsed.data.state ? sanitizeText(parsed.data.state, 60) : null;
  const city = parsed.data.city ? sanitizeText(parsed.data.city, 60) : null;
  const bannedWords = await getBannedWords();

  if (
    containsBannedWord(publicName, bannedWords) ||
    (message ? containsBannedWord(message, bannedWords) : false)
  ) {
    return NextResponse.json({ error: "Nome ou mensagem não permitidos." }, { status: 400 });
  }

  const prisma = getPrisma();
  const territory = await prisma.territory.findUnique({
    where: { slug: parsed.data.territorySlug },
  });

  if (!territory) {
    return NextResponse.json({ error: "Território não encontrado." }, { status: 404 });
  }

  const baseSlug = slugify(publicName);
  let user = await prisma.user.findUnique({ where: { slug: baseSlug } });

  if (user?.isBanned) {
    return NextResponse.json({ error: "Usuário bloqueado." }, { status: 403 });
  }

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { publicName, message, country, state, city },
    });
  } else {
    const slug = await uniqueSlug(publicName, async (candidate) => {
      const existing = await prisma.user.findUnique({ where: { slug: candidate }, select: { id: true } });
      return Boolean(existing);
    });
    user = await prisma.user.create({
      data: { publicName, slug, message, country, state, city },
    });
  }

  const amountCents = parsed.data.amountCents;
  const points = amountCentsToPoints(amountCents);
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      territoryId: territory.id,
      amountCents,
      points,
      status: PaymentStatus.PENDING,
    },
  });

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const notificationUrl = `${appUrl.replace(/\/$/, "")}/api/webhooks/mercadopago`;
    const provider = await createPixPayment({
      paymentId: payment.id,
      amountCents,
      description: `OwnMap - ${territory.name}`,
      payerName: publicName,
      notificationUrl,
    });

    const saved = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: provider.providerPaymentId,
        status: provider.status === PaymentStatus.APPROVED ? PaymentStatus.PENDING : provider.status,
        pixQrCode: provider.pixQrCode,
        pixQrCodeBase64: provider.pixQrCodeBase64,
        pixCopyPaste: provider.pixCopyPaste,
      },
    });

    if (provider.status === PaymentStatus.APPROVED) {
      await updatePaymentFromProvider(payment.id, PaymentStatus.APPROVED);
    }

    await prisma.auditLog.create({
      data: {
        action: "payment.created",
        actor: user.slug,
        metadata: {
          paymentId: payment.id,
          providerPaymentId: provider.providerPaymentId,
          amountCents,
          points,
          territoryId: territory.id,
        },
      },
    });

    return NextResponse.json({
      id: saved.id,
      status: saved.status,
      amountCents: saved.amountCents,
      points: saved.points,
      pixQrCode: saved.pixQrCode,
      pixQrCodeBase64: saved.pixQrCodeBase64,
      pixCopyPaste: saved.pixCopyPaste,
    });
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REJECTED },
    });

    await prisma.auditLog.create({
      data: {
        action: "payment.create_failed",
        actor: user.slug,
        metadata: { paymentId: payment.id, error: error instanceof Error ? error.message : "unknown" },
      },
    });

    return NextResponse.json({ error: "Não foi possível criar o Pix agora." }, { status: 502 });
  }
}
