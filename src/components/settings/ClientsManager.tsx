"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";

interface ClientsManagerProps {
  initialClients: Client[];
}

export function ClientsManager({ initialClients }: ClientsManagerProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Client>>({});
  const [error, setError] = useState("");

  async function handleSaveEdit(id: string) {
    setError("");
    const res = await fetch("/api/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error saving");
      return;
    }
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...editForm } : c))
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete client "${id}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    if (res.ok) setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAdd() {
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error adding client");
      return;
    }
    const added: Client = {
      id: newForm.id!,
      name: newForm.name!,
      office: newForm.office ?? "",
      ghlTag: newForm.ghlTag!,
      adAccountId: newForm.adAccountId!,
      payout: Number(newForm.payout ?? 0),
    };
    setClients((prev) => [...prev, added]);
    setAdding(false);
    setNewForm({});
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
          Clients
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add Client
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        {clients.map((client) => (
          <div key={client.id} className="p-4 bg-white dark:bg-neutral-900">
            {editingId === client.id ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={editForm.name ?? client.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="Office"
                  value={editForm.office ?? client.office}
                  onChange={(e) => setEditForm((f) => ({ ...f, office: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="GHL Tag"
                  value={editForm.ghlTag ?? client.ghlTag}
                  onChange={(e) => setEditForm((f) => ({ ...f, ghlTag: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder="Ad Account ID"
                  value={editForm.adAccountId ?? client.adAccountId}
                  onChange={(e) => setEditForm((f) => ({ ...f, adAccountId: e.target.value }))}
                />
                <input
                  className={inputClass}
                  type="number"
                  placeholder="Payout"
                  value={editForm.payout ?? client.payout}
                  onChange={(e) => setEditForm((f) => ({ ...f, payout: Number(e.target.value) }))}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(client.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {client.name}{" "}
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      — {client.office}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
                    Tag: {client.ghlTag} · Payout: ${client.payout}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(client.id);
                      setEditForm({});
                    }}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="p-4 bg-white dark:bg-neutral-900">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} placeholder="ID (slug, e.g. jorge)" onChange={(e) => setNewForm((f) => ({ ...f, id: e.target.value }))} />
              <input className={inputClass} placeholder="Name" onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
              <input className={inputClass} placeholder="Office" onChange={(e) => setNewForm((f) => ({ ...f, office: e.target.value }))} />
              <input className={inputClass} placeholder="GHL Tag" onChange={(e) => setNewForm((f) => ({ ...f, ghlTag: e.target.value }))} />
              <input className={inputClass} placeholder="Ad Account ID" onChange={(e) => setNewForm((f) => ({ ...f, adAccountId: e.target.value }))} />
              <input className={inputClass} type="number" placeholder="Payout ($)" onChange={(e) => setNewForm((f) => ({ ...f, payout: Number(e.target.value) }))} />
              <div className="flex gap-2 col-span-2">
                <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                  <Check size={14} /> Save
                </button>
                <button onClick={() => { setAdding(false); setNewForm({}); }} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
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
