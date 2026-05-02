import { MapShell } from "@/components/ownmap/MapShell";

type Props = {
  searchParams?: Promise<{ territory?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;

  return <MapShell initialSlug={params?.territory} />;
}
