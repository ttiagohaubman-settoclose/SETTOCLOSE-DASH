"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import type { Client } from "@/types";

interface SidebarProps {
  clients: Client[];
}

export function Sidebar({ clients }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const navItem = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === href
          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      )}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
          SetToClose
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isAdmin &&
          navItem(
            "/dashboard",
            "Agency",
            <LayoutDashboard size={16} />
          )}

        {/* Client links */}
        <div className="pt-1">
          {isAdmin && (
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
              Clients
            </p>
          )}
          {clients.map((client) => {
            const href = `/dashboard/${client.id}`;
            const active = pathname === href;
            if (!isAdmin && session?.user?.clientId !== client.id) return null;
            return (
              <Link
                key={client.id}
                href={href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                )}
              >
                <span>{client.name}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </div>

        {/* Settings (admin only) */}
        {isAdmin && (
          <div className="pt-3">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
              Admin
            </p>
            {navItem(
              "/dashboard/settings",
              "Settings",
              <Settings size={16} />
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <ThemeToggle className="px-3 py-2 w-full justify-start" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
