export function UserStats({
  positions,
}: {
  positions: {
    global: number | null;
    country: number | null;
    state: number | null;
    city: number | null;
  };
}) {
  const items = [
    ["Global", positions.global],
    ["País", positions.country],
    ["Estado", positions.state],
    ["Cidade", positions.city],
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="soft-card p-4">
          <div className="metric-label">{label}</div>
          <div className="mt-2 text-2xl font-black text-white">{value ? `#${value}` : "—"}</div>
        </div>
      ))}
    </div>
  );
}
