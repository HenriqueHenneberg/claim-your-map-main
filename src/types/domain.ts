export type TerritoryType = "GLOBAL" | "COUNTRY" | "STATE" | "CITY";
export type TerritoryStatus = "NONE" | "ACTIVE" | "COMPETITIVE" | "DOMINATED" | "WAR";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED";
export type RankingScope = "global" | "country" | "state" | "city";

export type PublicUser = {
  id: string;
  publicName: string;
  slug: string;
  message: string | null;
  country: string;
  state: string | null;
  city: string | null;
  totalPoints: number;
  totalPaidCents: number;
  isBanned?: boolean;
  createdAt?: string;
};

export type TerritorySummary = {
  id: string;
  slug: string;
  name: string;
  type: TerritoryType;
  country: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  status: TerritoryStatus;
  ownerId: string | null;
  owner: PublicUser | null;
  totalPoints: number;
  totalAmountCents: number;
  topScores?: TerritoryScoreSummary[];
};

export type TerritoryScoreSummary = {
  userId: string;
  points: number;
  amountCents: number;
  user: PublicUser;
};

export type RankEventSummary = {
  id: string;
  type: string;
  text: string;
  country: string | null;
  state: string | null;
  city: string | null;
  createdAt: string;
  user?: PublicUser | null;
  territory?: Pick<TerritorySummary, "id" | "slug" | "name" | "type" | "status"> | null;
};

export type RankingRow = {
  position: number;
  user: PublicUser;
  points: number;
  amountCents: number;
  title: string;
  location: string;
  territoryName?: string;
  pointsToPass: number;
};
