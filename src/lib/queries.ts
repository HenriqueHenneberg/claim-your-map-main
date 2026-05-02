import { PaymentStatus, RankEventType, TerritoryStatus } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { getRanking } from "@/lib/rankings";
import { formatCurrency, formatPoints } from "@/lib/format";
import { serializeEvent, serializeTerritory, serializeUser } from "@/lib/serializers";
import { takeoverGap } from "@/lib/territory-rules";

export async function getTerritoriesList() {
  const prisma = getPrisma();
  const territories = await prisma.territory.findMany({
    include: {
      owner: true,
      scores: {
        include: { user: true },
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        take: 5,
      },
    },
    orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
  });

  return territories.map(serializeTerritory);
}

export async function getRecentEvents(limit = 12) {
  const prisma = getPrisma();
  const events = await prisma.rankEvent.findMany({
    include: { user: true, territory: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return events.map(serializeEvent);
}

export async function getHomeData() {
  const [territories, events, globalRanking] = await Promise.all([
    getTerritoriesList(),
    getRecentEvents(14),
    getRanking({ scope: "global", limit: 8 }),
  ]);

  const warZones = territories
    .filter((territory) => territory.status === "WAR")
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const cheapTerritories = territories
    .filter((territory) => territory.type !== "GLOBAL")
    .map((territory) => ({
      territory,
      gap: takeoverGap(territory.topScores ?? []),
    }))
    .sort((a, b) => a.gap.amountCents - b.gap.amountCents)
    .slice(0, 5);

  const stats = {
    totalRaisedCents: territories.reduce((sum, territory) => sum + territory.totalAmountCents, 0),
    totalPoints: territories.reduce((sum, territory) => sum + territory.totalPoints, 0),
    activeTerritories: territories.filter((territory) => territory.status !== "NONE").length,
    warZones: warZones.length,
  };

  return {
    territories,
    selectedTerritory: territories.find((territory) => territory.slug === "curitiba-pr") ?? territories[0] ?? null,
    warZones,
    cheapTerritories,
    events,
    globalRanking: globalRanking.rows,
    stats,
  };
}

export async function getTerritoryDetail(slug: string) {
  const prisma = getPrisma();
  const territory = await prisma.territory.findUnique({
    where: { slug },
    include: {
      owner: true,
      scores: {
        include: { user: true },
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        take: 10,
      },
      events: {
        include: { user: true, territory: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      payments: {
        where: { status: PaymentStatus.APPROVED },
        orderBy: { approvedAt: "asc" },
        take: 40,
      },
    },
  });

  if (!territory) return null;

  let cumulative = 0;
  const chart = territory.payments.slice(-12).map((payment) => {
    cumulative += payment.points;
    return {
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
        payment.approvedAt ?? payment.createdAt,
      ),
      points: cumulative,
    };
  });

  const serialized = serializeTerritory(territory);
  return {
    territory: serialized,
    topScores: territory.scores.map((score) => ({
      user: serializeUser(score.user),
      points: score.points,
      amountCents: score.amountCents,
    })),
    takeover: takeoverGap(territory.scores),
    events: territory.events.map(serializeEvent),
    history: territory.events
      .filter((event) =>
        new Set<RankEventType>([
          RankEventType.TERRITORY_TAKEN,
          RankEventType.WAR_STARTED,
          RankEventType.USER_PASSED,
        ]).has(event.type),
      )
      .map(serializeEvent),
    chart,
  };
}

export async function getUserProfile(slug: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      scores: {
        include: { territory: { include: { owner: true } } },
        orderBy: { points: "desc" },
      },
      events: {
        include: { user: true, territory: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) return null;

  const [global, country, state, city] = await Promise.all([
    getRanking({ scope: "global", limit: 100 }),
    getRanking({ scope: "country", country: user.country, limit: 100 }),
    user.state ? getRanking({ scope: "state", country: user.country, state: user.state, limit: 100 }) : null,
    user.city ? getRanking({ scope: "city", country: user.country, state: user.state, city: user.city, limit: 100 }) : null,
  ]);

  const findPosition = (rows?: { user: { id: string }; position: number }[]) =>
    rows?.find((row) => row.user.id === user.id)?.position ?? null;

  const dominated = user.scores
    .filter((score) => score.territory.ownerId === user.id)
    .map((score) => score.territory);

  return {
    user: serializeUser(user),
    positions: {
      global: findPosition(global.rows),
      country: findPosition(country.rows),
      state: findPosition(state?.rows),
      city: findPosition(city?.rows),
    },
    titles: dominated.map((territory) => ({
      territory: territory.name,
      slug: territory.slug,
      type: territory.type,
    })),
    dominatedTerritories: dominated.map((territory) => serializeTerritory(territory)),
    territoryHistory: user.scores.map((score) => ({
      territory: serializeTerritory(score.territory),
      points: score.points,
      amountCents: score.amountCents,
    })),
    events: user.events.map(serializeEvent),
  };
}

export async function getAdminStats() {
  const prisma = getPrisma();
  const [
    approvedAggregate,
    pendingPayments,
    approvedPayments,
    activeUsers,
    topTerritories,
    warTerritories,
    topPayers,
    events,
    logs,
    payments,
    users,
    territories,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountCents: true },
      where: { status: PaymentStatus.APPROVED },
    }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.payment.count({ where: { status: PaymentStatus.APPROVED } }),
    prisma.user.count({ where: { totalPoints: { gt: 0 }, isBanned: false } }),
    prisma.territory.findMany({
      include: { owner: true },
      orderBy: { totalAmountCents: "desc" },
      take: 6,
    }),
    prisma.territory.findMany({
      where: { status: TerritoryStatus.WAR },
      include: { owner: true },
      orderBy: { totalPoints: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      where: { totalPaidCents: { gt: 0 } },
      orderBy: { totalPaidCents: "desc" },
      take: 6,
    }),
    getRecentEvents(8),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.payment.findMany({
      include: { user: true, territory: true },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.user.findMany({ orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }], take: 40 }),
    prisma.territory.findMany({ include: { owner: true }, orderBy: { totalPoints: "desc" }, take: 40 }),
  ]);

  return {
    totals: {
      raised: approvedAggregate._sum.amountCents ?? 0,
      pendingPayments,
      approvedPayments,
      activeUsers,
    },
    topTerritories: topTerritories.map(serializeTerritory),
    warTerritories: warTerritories.map(serializeTerritory),
    topPayers: topPayers.map(serializeUser),
    events,
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
    payments: payments.map((payment) => ({
      id: payment.id,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      amountCents: payment.amountCents,
      points: payment.points,
      createdAt: payment.createdAt.toISOString(),
      user: serializeUser(payment.user),
      territory: serializeTerritory(payment.territory),
    })),
    users: users.map(serializeUser),
    territories: territories.map(serializeTerritory),
    labels: {
      raised: formatCurrency(approvedAggregate._sum.amountCents ?? 0),
      activeUsers: formatPoints(activeUsers),
    },
  };
}
