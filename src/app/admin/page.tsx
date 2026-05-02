import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const data = await getAdminStats();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-6">
      <AdminDashboard data={data} />
    </div>
  );
}
