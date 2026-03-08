const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.toString() || "";
const TENANT_ID = import.meta.env.VITE_TENANT_ID?.toString() || "";
const TENANT_DOMAIN = import.meta.env.VITE_TENANT_DOMAIN?.toString() || "";

export function withTenant(path: string): string {
  const params = new URLSearchParams();
  if (TENANT_ID) params.set("tenantId", TENANT_ID);
  else if (TENANT_DOMAIN) params.set("domain", TENANT_DOMAIN);
  if (params.toString() === "") return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${params.toString()}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}
