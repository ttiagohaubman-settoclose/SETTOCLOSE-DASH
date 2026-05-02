import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getClientById } from "@/lib/clients";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

interface PageProps {
  params: { clientId: string };
}

export default async function ClientPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { clientId } = params;

  // Client users can only see their own page
  if (session.user.role === "client" && session.user.clientId !== clientId) {
    redirect(`/dashboard/${session.user.clientId}`);
  }

  const client = await getClientById(clientId);
  if (!client) notFound();

  return (
    <ClientDashboard
      clientId={client.id}
      clientName={client.name}
      office={client.office}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const client = await getClientById(params.clientId);
  return {
    title: client ? `${client.name} — SetToClose` : "SetToClose",
  };
}
