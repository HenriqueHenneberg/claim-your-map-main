export function TerritoryTooltip({
  x,
  y,
  title,
  subtitle,
}: {
  x: number;
  y: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-30 rounded-lg border border-white/10 bg-zinc-950/95 px-3 py-2 text-xs shadow-2xl"
      style={{ left: x + 14, top: y + 14 }}
    >
      <div className="font-bold text-amber-200">{title}</div>
      <div className="text-zinc-400">{subtitle}</div>
    </div>
  );
}
