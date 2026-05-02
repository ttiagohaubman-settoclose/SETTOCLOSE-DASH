"use client";

import { useState } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Client } from "@/types";

interface UsersManagerProps {
  initialUsers: Omit<User, "passwordHash">[];
  clients: Client[];
}

export function UsersManager({ initialUsers, clients }: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", clientId: "" });
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error adding user");
      return;
    }
    const newUser = await res.json();
    setUsers((prev) => [...prev, newUser]);
    setAdding(false);
    setForm({ email: "", password: "", clientId: "" });
  }

  async function handleDelete(email: string) {
    if (!confirm(`Remove user "${email}"?`)) return;
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.email !== email));
  }

  const inputClass = cn(
    "px-3 py-1.5 text-sm rounded-md border w-full",
    "border-neutral-200 dark:border-neutral-700",
    "bg-neutral-50 dark:bg-neutral-800",
    "text-neutral-900 dark:text-white",
    "focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Client Users
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add User
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        {users.length === 0 && !adding && (
          <div className="px-4 py-8 text-center text-sm text-neutral-400 dark:text-neutral-600 bg-white dark:bg-neutral-900">
            No client users yet
          </div>
        )}

        {users.map((user) => {
          const client = clients.find((c) => c.id === user.clientId);
          return (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user.email}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
                  {client ? `${client.name} — ${client.office}` : user.clientId ?? "No client assigned"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(user.email)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {adding && (
          <div className="p-4 bg-white dark:bg-neutral-900">
            <div className="space-y-2">
              <input
                className={inputClass}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <input
                className={inputClass}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
              <select
                className={inputClass}
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              >
                <option value="">— Assign to client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.office})
                  </option>
                ))}
              </select>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => { setAdding(false); setForm({ email: "", password: "", clientId: "" }); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
