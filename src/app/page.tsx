import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "client" && session.user.clientId) {
    redirect(`/dashboard/${session.user.clientId}`);
  }

  redirect("/dashboard");
}
