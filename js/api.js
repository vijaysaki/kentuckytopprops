import {
  API_BASE_URL,
  PRODUCTS_ENDPOINT,
  PRODUCTS_LIST_ENDPOINT,
  PAGES_ENDPOINT,
  BLOGS_ENDPOINT,
  CONTACT_FORMS_ENDPOINT,
  TENANT_ID,
  TENANT_DOMAIN,
  PRODUCTS_PAGE_SIZE,
  fallbackProducts,
  fallbackServices
} from "./config.js";

export function getTenantQueryParams() {
  const params = new URLSearchParams();
  if (TENANT_ID) {
    params.set("tenantId", TENANT_ID);
    return params;
  }
  const host = window.location.hostname.toLowerCase();
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  params.set("domain", isLocalHost ? TENANT_DOMAIN : host);
  return params;
}

export async function fetchTenantScoped(endpoint) {
  const params = getTenantQueryParams();
  const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`);
  if (!response.ok) throw new Error(`Request failed for ${endpoint}`);
  return response.json();
}

export async function fetchMenuData(endpoint, fallback) {
  try {
    const params = getTenantQueryParams();
    const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`);
    if (!response.ok) throw new Error("API request failed");
    const payload = await response.json();
    const data = Array.isArray(payload) ? payload : payload.data;
    const normalized = normalizeMenuItems(data);
    return normalized.length ? normalized : fallback;
  } catch (error) {
    console.warn("Using fallback menu data for", endpoint, error);
    return fallback;
  }
}

function normalizeMenuItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const childrenSource = Array.isArray(item.children)
      ? item.children
      : Array.isArray(item.subcategories)
        ? item.subcategories
        : [];
    const children = normalizeMenuItems(childrenSource);
    return {
      id: item.id,
      parentId: item.parentId || item.parent_id || null,
      slug: item.slug || null,
      name: item.name || item.title || "Untitled",
      description: item.description || item.content || "",
      content: item.content || "",
      url: item.url || item.link || item.slug || "#",
      children
    };
  });
}

export async function fetchPublicProductsList(options = {}) {
  const params = getTenantQueryParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const response = await fetch(`${API_BASE_URL}${PRODUCTS_LIST_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch (_) {}
    const msg = body?.slice(0, 200) || response.statusText;
    throw new Error(`Products API ${response.status}: ${msg}`);
  }
  return response.json();
}

export async function fetchProductBySlug(slug) {
  const params = getTenantQueryParams();
  const response = await fetch(
    `${API_BASE_URL}/public/products/by-slug/${encodeURIComponent(slug)}?${params.toString()}`
  );
  if (!response.ok) throw new Error(`Product not found: ${response.status}`);
  return response.json();
}

export async function fetchProductsForCategory(category, offset = 0) {
  const slug = category?.slug || "";
  const id = category?.id || "";
  const limit = PRODUCTS_PAGE_SIZE;
  const attempts = [
    { categorySlug: slug, limit, offset },
    { categoryId: id, limit, offset }
  ];

  let lastError = null;
  for (const params of attempts) {
    if (!params.categorySlug && !params.categoryId) continue;
    try {
      const payload = await fetchPublicProductsList(params);
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];
      const total = payload?.total ?? items.length;
      return { items, total, limit, offset };
    } catch (error) {
      lastError = error;
    }
  }

  if (id) {
    try {
      const payload = await fetchPublicProductsList({ limit: 100, offset: 0 });
      const all = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
      const items = all.filter(
        (p) =>
          p.categoryId === id ||
          (p.category?.id === id) ||
          (p.categoryLinks || []).some((l) => l.categoryId === id)
      );
      return { items, total: items.length, limit: items.length, offset: 0 };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Unable to load products for category");
}

let pagesCache = null;

export async function getPagesCache() {
  if (pagesCache) return pagesCache;
  const payload = await fetchTenantScoped(PAGES_ENDPOINT);
  pagesCache = Array.isArray(payload) ? payload : payload.data;
  return Array.isArray(pagesCache) ? pagesCache : [];
}

export async function fetchContactFormForRoute(routeKey) {
  try {
    const payload = await fetchTenantScoped(CONTACT_FORMS_ENDPOINT);
    const forms = Array.isArray(payload) ? payload : payload.data;
    if (!Array.isArray(forms) || !forms.length) return null;
    const normalized = String(routeKey || "").toLowerCase();
    const matched =
      forms.find((f) => String(f.slug || "").toLowerCase() === normalized) ||
      forms.find((f) => String(f.slug || "").toLowerCase().includes(normalized)) ||
      forms[0];
    return matched || null;
  } catch (error) {
    console.warn("Unable to fetch public contact forms", error);
    return null;
  }
}
