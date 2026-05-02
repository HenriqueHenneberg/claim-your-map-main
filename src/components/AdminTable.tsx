export function AdminTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="soft-card overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-black text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
