import { HomeDashboard } from "@/components/HomeDashboard";
import { getHomeData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="px-4 pb-12 pt-24 md:px-6">
      <HomeDashboard {...data} />
    </div>
  );
}
