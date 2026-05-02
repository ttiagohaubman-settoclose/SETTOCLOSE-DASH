import { CLIENTS, type ClientKey } from "@/config/clients";

type Props = { value: ClientKey; onChange: (next: ClientKey) => void };

export function ClientSelector({ value, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as ClientKey)}>
      {CLIENTS.map((client) => (
        <option key={client.key} value={client.key}>{client.displayName}</option>
      ))}
    </select>
  );
}
