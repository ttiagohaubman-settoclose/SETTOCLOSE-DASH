import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AgencyDashboard } from "@/components/dashboard/AgencyDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") {
    redirect(`/dashboard/${session.user.clientId}`);
  }

  return <AgencyDashboard />;
}
