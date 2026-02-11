
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.toString() || "";
export const TENANT_ID = import.meta.env.VITE_TENANT_ID?.toString() || "";

export function withTenant(path: string): string {
  if (!TENANT_ID) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}tenantId=${encodeURIComponent(TENANT_ID)}`;
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
