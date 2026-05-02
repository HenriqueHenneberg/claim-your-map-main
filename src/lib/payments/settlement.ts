import { PaymentStatus, RankEventType } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { formatCurrency, formatPoints } from "@/lib/format";
import { resolveTerritoryStatus, titleForTerritory } from "@/lib/territory-rules";

export async function approvePaymentOnce(paymentId: string) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { user: true, territory: true },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === PaymentStatus.APPROVED) {
      return { processed: false, paymentId: payment.id, alreadyApproved: true };
    }

    const oldScores = await tx.territoryScore.findMany({
      where: { territoryId: payment.territoryId },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    });
    const oldRank = oldScores.findIndex((score) => score.userId === payment.userId);
    const previousOwnerId = payment.territory.ownerId;
    const previousStatus = payment.territory.status;

    const locked = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: PaymentStatus.APPROVED } },
      data: {
        status: PaymentStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    if (locked.count === 0) {
      return { processed: false, paymentId: payment.id, alreadyApproved: true };
    }

    await tx.user.update({
      where: { id: payment.userId },
      data: {
        totalPoints: { increment: payment.points },
        totalPaidCents: { increment: payment.amountCents },
      },
    });

    await tx.territoryScore.upsert({
      where: {
        userId_territoryId: {
          userId: payment.userId,
          territoryId: payment.territoryId,
        },
      },
      create: {
        userId: payment.userId,
        territoryId: payment.territoryId,
        points: payment.points,
        amountCents: payment.amountCents,
      },
      update: {
        points: { increment: payment.points },
        amountCents: { increment: payment.amountCents },
      },
    });

    await tx.territory.update({
      where: { id: payment.territoryId },
      data: {
        totalPoints: { increment: payment.points },
        totalAmountCents: { increment: payment.amountCents },
      },
    });

    const newScores = await tx.territoryScore.findMany({
      where: { territoryId: payment.territoryId },
      include: { user: true },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    });
    const newOwnerId = newScores[0]?.userId ?? null;
    const newStatus = resolveTerritoryStatus(newScores);
    const newRank = newScores.findIndex((score) => score.userId === payment.userId);

    await tx.territory.update({
      where: { id: payment.territoryId },
      data: {
        ownerId: newOwnerId,
        status: newStatus,
      },
    });

    const userName = payment.user.publicName;
    const territoryName = payment.territory.name;
    const eventBase = {
      userId: payment.userId,
      territoryId: payment.territoryId,
      country: payment.territory.country,
      state: payment.territory.state,
      city: payment.territory.city,
    };

    await tx.rankEvent.create({
      data: {
        ...eventBase,
        type: RankEventType.PAYMENT_APPROVED,
        text: `${userName} confirmou Pix de ${formatCurrency(payment.amountCents)} e ganhou ${formatPoints(payment.points)} pontos em ${territoryName}.`,
      },
    });

    if (previousOwnerId !== newOwnerId && newOwnerId === payment.userId) {
      await tx.rankEvent.create({
        data: {
          ...eventBase,
          type: RankEventType.TERRITORY_TAKEN,
          text: `${userName} tomou ${territoryName} e virou ${titleForTerritory(payment.territory.type)}.`,
        },
      });
    }

    if (newStatus === "WAR" && previousStatus !== "WAR") {
      await tx.rankEvent.create({
        data: {
          ...eventBase,
          type: RankEventType.WAR_STARTED,
          text: `${territoryName} está em guerra. Alguém pode tomar o topo a qualquer momento.`,
        },
      });
    }

    if ((oldRank === -1 || oldRank >= 10) && newRank > -1 && newRank < 10) {
      await tx.rankEvent.create({
        data: {
          ...eventBase,
          type: RankEventType.TOP_10_ENTERED,
          text: `${userName} entrou no top 10 de ${territoryName}.`,
        },
      });
    }

    if (oldRank > newRank && newRank > -1) {
      const passedUser = newScores[newRank + 1]?.user;
      if (passedUser) {
        await tx.rankEvent.create({
          data: {
            ...eventBase,
            type: RankEventType.USER_PASSED,
            text: `${userName} ultrapassou ${passedUser.publicName} em ${territoryName}.`,
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        action: "payment.approved",
        actor: "mercadopago",
        metadata: {
          paymentId: payment.id,
          providerPaymentId: payment.providerPaymentId,
          userId: payment.userId,
          territoryId: payment.territoryId,
          points: payment.points,
          amountCents: payment.amountCents,
          newOwnerId,
          newStatus,
        },
      },
    });

    return { processed: true, paymentId: payment.id, newOwnerId, newStatus };
  });
}

export async function updatePaymentFromProvider(
  paymentId: string,
  status: PaymentStatus,
) {
  if (status === PaymentStatus.APPROVED) {
    return approvePaymentOnce(paymentId);
  }

  const prisma = getPrisma();
  await prisma.payment.updateMany({
    where: { id: paymentId, status: { not: PaymentStatus.APPROVED } },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      action: "payment.status_updated",
      actor: "mercadopago",
      metadata: { paymentId, status },
    },
  });

  return { processed: false, paymentId, status };
}
