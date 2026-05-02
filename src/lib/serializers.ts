import type {
  RankEvent,
  Territory,
  TerritoryScore,
  User,
} from "@prisma/client";
import type {
  PublicUser,
  RankEventSummary,
  TerritoryScoreSummary,
  TerritorySummary,
} from "@/types/domain";

export function serializeUser(user: User): PublicUser {
  return {
    id: user.id,
    publicName: user.publicName,
    slug: user.slug,
    message: user.message,
    country: user.country,
    state: user.state,
    city: user.city,
    totalPoints: user.totalPoints,
    totalPaidCents: user.totalPaidCents,
    isBanned: user.isBanned,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeTerritory(
  territory: Territory & {
    owner?: User | null;
    scores?: Array<TerritoryScore & { user: User }>;
  },
): TerritorySummary {
  return {
    id: territory.id,
    slug: territory.slug,
    name: territory.name,
    type: territory.type,
    country: territory.country,
    state: territory.state,
    city: territory.city,
    latitude: territory.latitude,
    longitude: territory.longitude,
    status: territory.status,
    ownerId: territory.ownerId,
    owner: territory.owner ? serializeUser(territory.owner) : null,
    totalPoints: territory.totalPoints,
    totalAmountCents: territory.totalAmountCents,
    topScores: territory.scores?.map(serializeTerritoryScore),
  };
}

export function serializeTerritoryScore(
  score: TerritoryScore & { user: User },
): TerritoryScoreSummary {
  return {
    userId: score.userId,
    points: score.points,
    amountCents: score.amountCents,
    user: serializeUser(score.user),
  };
}

export function serializeEvent(
  event: RankEvent & {
    user?: User | null;
    territory?: Territory | null;
  },
): RankEventSummary {
  return {
    id: event.id,
    type: event.type,
    text: event.text,
    country: event.country,
    state: event.state,
    city: event.city,
    createdAt: event.createdAt.toISOString(),
    user: event.user ? serializeUser(event.user) : null,
    territory: event.territory
      ? {
          id: event.territory.id,
          slug: event.territory.slug,
          name: event.territory.name,
          type: event.territory.type,
          status: event.territory.status,
        }
      : null,
  };
}
