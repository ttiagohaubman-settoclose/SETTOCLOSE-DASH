import type { Client } from "@/types";
import { redisGet, redisSet } from "./redis";

const DEFAULT_CLIENTS: Client[] = [
  {
    id: "jorge",
    name: "Jorge",
    office: "Virginia",
    ghlTag: "va leads - jorge",
    adAccountId: "1423143898800903",
    payout: 750,
  },
  {
    id: "fernando",
    name: "Fernando",
    office: "Maryland",
    ghlTag: "md leads - fernando",
    adAccountId: "795631173072316",
    payout: 500,
  },
  {
    id: "danelly",
    name: "Danelly",
    office: "North Carolina",
    ghlTag: "nc leads - danelly",
    adAccountId: "1569261187694774",
    payout: 750,
  },
  {
    id: "ay",
    name: "A&Y",
    office: "South Carolina",
    ghlTag: "sc leads - a&y",
    adAccountId: "751411627703795",
    payout: 750,
  },
];

const CLIENTS_KEY = "clients";

export async function getClients(): Promise<Client[]> {
  const stored = await redisGet<Client[]>(CLIENTS_KEY);
  if (!stored) {
    await redisSet(CLIENTS_KEY, DEFAULT_CLIENTS);
    return DEFAULT_CLIENTS;
  }

  // Auto-fix any stale adAccountId that doesn't match the current defaults
  let dirty = false;
  for (const client of stored) {
    const def = DEFAULT_CLIENTS.find((d) => d.id === client.id);
    if (def && client.adAccountId !== def.adAccountId) {
      client.adAccountId = def.adAccountId;
      dirty = true;
    }
  }
  if (dirty) await redisSet(CLIENTS_KEY, stored);

  return stored;
}

export async function getClientById(id: string): Promise<Client | null> {
  const clients = await getClients();
  return clients.find((c) => c.id === id) ?? null;
}

export async function saveClients(clients: Client[]): Promise<void> {
  await redisSet(CLIENTS_KEY, clients);
}

export async function addClient(client: Client): Promise<void> {
  const clients = await getClients();
  if (clients.find((c) => c.id === client.id)) {
    throw new Error(`Client with id "${client.id}" already exists`);
  }
  await saveClients([...clients, client]);
}

export async function updateClient(
  id: string,
  updates: Partial<Omit<Client, "id">>
): Promise<void> {
  const clients = await getClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Client "${id}" not found`);
  clients[idx] = { ...clients[idx], ...updates };
  await saveClients(clients);
}

export async function deleteClient(id: string): Promise<void> {
  const clients = await getClients();
  await saveClients(clients.filter((c) => c.id !== id));
}
