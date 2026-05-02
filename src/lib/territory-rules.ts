import type { TerritoryStatus, TerritoryType } from "@/types/domain";

type ScoreLike = {
  points: number;
};

export function resolveTerritoryStatus(scores: ScoreLike[]): TerritoryStatus {
  if (scores.length === 0) return "NONE";
  if (scores.length === 1) return "ACTIVE";

  const [first, second] = [...scores].sort((a, b) => b.points - a.points);
  if (!second) return "ACTIVE";
  if (first.points > second.points * 2) return "DOMINATED";
  if (first.points - second.points <= 500) return "WAR";
  return "COMPETITIVE";
}

export function takeoverGap(scores: ScoreLike[]) {
  const [first, second] = [...scores].sort((a, b) => b.points - a.points);

  if (!first) {
    return { points: 100, amountCents: 100 };
  }

  const challengerPoints = second?.points ?? 0;
  const needed = Math.max(100, first.points - challengerPoints + 100);
  return { points: needed, amountCents: needed };
}

export function titleForTerritory(type: TerritoryType, position = 1) {
  if (position !== 1) return `Desafiante #${position}`;

  const titles: Record<TerritoryType, string> = {
    GLOBAL: "Imperador Global",
    COUNTRY: "Presidente",
    STATE: "Governador",
    CITY: "Prefeito",
  };
  return titles[type];
}
