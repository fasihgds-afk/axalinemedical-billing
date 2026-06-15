import { getDevAuthConfig } from "@/lib/devAuth";

let devClients = [
  {
    _id: "dev-client-1",
    name: "Metro Health Clinic",
    email: "billing@metrohealth.com",
    phone: "(555) 123-4567",
    address: "123 Main Street, Suite 100",
    notes: "Sample client for demo mode",
    createdBy: "dev-local-user",
    createdAt: new Date("2025-01-15").toISOString(),
    updatedAt: new Date("2025-01-15").toISOString(),
  },
  {
    _id: "dev-client-2",
    name: "Sunrise Pediatrics",
    email: "accounts@sunrisepeds.com",
    phone: "(555) 987-6543",
    address: "456 Oak Avenue",
    notes: "",
    createdBy: "dev-local-user",
    createdAt: new Date("2025-02-20").toISOString(),
    updatedAt: new Date("2025-02-20").toISOString(),
  },
];

function generateId() {
  return `dev-client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function matchesSearch(client, search) {
  if (!search?.trim()) return true;

  const query = search.toLowerCase().trim();

  return [client.name, client.email, client.phone, client.address, client.notes].some(
    (field) => field?.toLowerCase().includes(query)
  );
}

export function listDevClients({ search = "" } = {}) {
  const filtered = devClients
    .filter((client) => matchesSearch(client, search))
    .sort((a, b) => a.name.localeCompare(b.name));

  return filtered.map((client) => ({ ...client }));
}

export function getDevClientById(id) {
  const client = devClients.find((item) => item._id === id);
  return client ? { ...client } : null;
}

export function createDevClient(data) {
  const config = getDevAuthConfig();
  const now = new Date().toISOString();

  const client = {
    _id: generateId(),
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    notes: data.notes || "",
    createdBy: config.userId,
    createdAt: now,
    updatedAt: now,
  };

  devClients = [...devClients, client];
  return { ...client };
}

export function updateDevClient(id, data) {
  const index = devClients.findIndex((item) => item._id === id);

  if (index === -1) return null;

  const updated = {
    ...devClients[index],
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    notes: data.notes || "",
    updatedAt: new Date().toISOString(),
  };

  devClients = [
    ...devClients.slice(0, index),
    updated,
    ...devClients.slice(index + 1),
  ];

  return { ...updated };
}

export function deleteDevClient(id) {
  const exists = devClients.some((item) => item._id === id);

  if (!exists) return false;

  devClients = devClients.filter((item) => item._id !== id);
  return true;
}

export { listDevPaymentsByClient as getDevClientPayments } from "@/lib/devPaymentStore";
