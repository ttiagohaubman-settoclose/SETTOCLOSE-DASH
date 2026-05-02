import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getClients } from "@/lib/clients";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const clients = await getClients();

  return (
    <div className="flex min-h-screen">
      <Sidebar clients={clients} />
      <div className="flex-1 ml-56">
        {children}
      </div>
    </div>
  );
}
