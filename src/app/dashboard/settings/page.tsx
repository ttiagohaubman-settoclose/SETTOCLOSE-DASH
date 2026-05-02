import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getClients } from "@/lib/clients";
import { redisKeys, redisGet } from "@/lib/redis";
import { ClientsManager } from "@/components/settings/ClientsManager";
import { UsersManager } from "@/components/settings/UsersManager";
import { GHLSync } from "@/components/settings/GHLSync";
import type { User } from "@/types";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  const clients = await getClients();

  // Fetch all client users
  const keys = await redisKeys("users:*");
  const users: Omit<User, "passwordHash">[] = [];
  for (const key of keys) {
    const user = await redisGet<User>(key);
    if (user) {
      const { passwordHash: _, ...safe } = user;
      users.push(safe);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-8 py-4">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage clients and users
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-6 space-y-8 max-w-2xl">
        <GHLSync />
        <ClientsManager initialClients={clients} />
        <UsersManager initialUsers={users} clients={clients} />
      </main>
    </div>
  );
}
