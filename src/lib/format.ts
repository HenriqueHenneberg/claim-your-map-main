import type { TerritoryStatus, TerritoryType } from "@/types/domain";

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatPoints(points: number) {
  return new Intl.NumberFormat("pt-BR").format(points);
}

export function amountCentsToPoints(amountCents: number) {
  return Math.floor(amountCents);
}

export function pointsToAmountCents(points: number) {
  return Math.max(100, points);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function locationLabel(user: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}) {
  return [user.city, user.state, user.country].filter(Boolean).join(", ");
}

export function territoryTypeLabel(type: TerritoryType) {
  const labels: Record<TerritoryType, string> = {
    GLOBAL: "Global",
    COUNTRY: "País",
    STATE: "Estado",
    CITY: "Cidade",
  };
  return labels[type];
}

export function statusLabel(status: TerritoryStatus) {
  const labels: Record<TerritoryStatus, string> = {
    NONE: "Sem domínio",
    ACTIVE: "Ativo",
    COMPETITIVE: "Competitivo",
    DOMINATED: "Dominado",
    WAR: "Guerra ativa",
  };
  return labels[status];
}

export function titleForPosition(type: TerritoryType | "GLOBAL", position: number) {
  if (position !== 1) return `Desafiante #${position}`;

  const titles: Record<TerritoryType | "GLOBAL", string> = {
    GLOBAL: "Imperador Global",
    COUNTRY: "Presidente",
    STATE: "Governador",
    CITY: "Prefeito",
  };

  return titles[type];
}

export function statusClass(status: TerritoryStatus) {
  const classes: Record<TerritoryStatus, string> = {
    NONE: "border-zinc-700 bg-zinc-800/70 text-zinc-300",
    ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    COMPETITIVE: "border-emerald-400/40 bg-emerald-400/15 text-emerald-100",
    DOMINATED: "border-amber-400/50 bg-amber-400/15 text-amber-100",
    WAR: "border-orange-500/50 bg-orange-500/15 text-orange-100",
  };
  return classes[status];
}

export function compactDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
