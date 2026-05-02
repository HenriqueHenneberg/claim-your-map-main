import { Prisma, TerritoryType } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { locationLabel, titleForPosition } from "@/lib/format";
import { serializeUser } from "@/lib/serializers";
import type { RankingRow, RankingScope } from "@/types/domain";

type RankingInput = {
  scope: RankingScope;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  search?: string | null;
  limit?: number;
};

const scopeToTerritoryType: Record<Exclude<RankingScope, "global">, TerritoryType> = {
  country: TerritoryType.COUNTRY,
  state: TerritoryType.STATE,
  city: TerritoryType.CITY,
};

export async function getRanking(input: RankingInput) {
  const prisma = getPrisma();
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const scope = input.scope;

  if (scope === "global") {
    const where: Prisma.UserWhereInput = {
      isBanned: false,
      ...(input.country ? { country: { equals: input.country, mode: "insensitive" } } : {}),
      ...(input.state ? { state: { equals: input.state, mode: "insensitive" } } : {}),
      ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
    };

    if (input.search) {
      where.OR = [
        { publicName: { contains: input.search, mode: "insensitive" } },
        { message: { contains: input.search, mode: "insensitive" } },
        { city: { contains: input.search, mode: "insensitive" } },
        { state: { contains: input.search, mode: "insensitive" } },
        { country: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
      take: limit,
    });

    const rows: RankingRow[] = users.map((user, index) => {
      const previous = users[index - 1];
      return {
        position: index + 1,
        user: serializeUser(user),
        points: user.totalPoints,
        amountCents: user.totalPaidCents,
        title: titleForPosition("GLOBAL", index + 1),
        location: locationLabel(user),
        pointsToPass: previous ? Math.max(0, previous.totalPoints - user.totalPoints + 1) : 0,
      };
    });

    return { scope, rows };
  }

  const territoryWhere: Prisma.TerritoryWhereInput = {
    type: scopeToTerritoryType[scope],
    ...(input.country ? { country: { equals: input.country, mode: "insensitive" } } : {}),
    ...(input.state ? { state: { equals: input.state, mode: "insensitive" } } : {}),
    ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
  };

  const where: Prisma.TerritoryScoreWhereInput = {
    territory: territoryWhere,
    user: { isBanned: false },
  };

  if (input.search) {
    where.OR = [
      { user: { publicName: { contains: input.search, mode: "insensitive" } } },
      { user: { message: { contains: input.search, mode: "insensitive" } } },
      { territory: { name: { contains: input.search, mode: "insensitive" } } },
      { territory: { slug: { contains: input.search, mode: "insensitive" } } },
    ];
  }

  const scores = await prisma.territoryScore.findMany({
    where,
    include: { user: true, territory: true },
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
  });

  const aggregated = new Map<
    string,
    {
      user: (typeof scores)[number]["user"];
      points: number;
      amountCents: number;
      firstScoredAt: Date;
      territoryNames: Set<string>;
    }
  >();

  for (const score of scores) {
    const current = aggregated.get(score.userId);
    if (current) {
      current.points += score.points;
      current.amountCents += score.amountCents;
      current.territoryNames.add(score.territory.name);
      if (score.createdAt < current.firstScoredAt) current.firstScoredAt = score.createdAt;
    } else {
      aggregated.set(score.userId, {
        user: score.user,
        points: score.points,
        amountCents: score.amountCents,
        firstScoredAt: score.createdAt,
        territoryNames: new Set([score.territory.name]),
      });
    }
  }

  const sorted = [...aggregated.values()]
    .sort((a, b) => b.points - a.points || a.firstScoredAt.getTime() - b.firstScoredAt.getTime())
    .slice(0, limit);

  const rows: RankingRow[] = sorted.map((entry, index) => {
    const previous = sorted[index - 1];
    const type = scopeToTerritoryType[scope];
    return {
      position: index + 1,
      user: serializeUser(entry.user),
      points: entry.points,
      amountCents: entry.amountCents,
      title: titleForPosition(type, index + 1),
      location: locationLabel(entry.user),
      territoryName: [...entry.territoryNames].slice(0, 2).join(", "),
      pointsToPass: previous ? Math.max(0, previous.points - entry.points + 1) : 0,
    };
  });

  return { scope, rows };
}
