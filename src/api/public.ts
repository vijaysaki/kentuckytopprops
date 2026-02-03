import { apiGet, withTenant } from "./client";
import type { ContactForm, Menu, Page, Product, ProductCategory, Service } from "./types";

export async function fetchPages(): Promise<Page[]> {
  return apiGet<Page[]>(withTenant("/public/pages"));
}

export async function fetchMenus(): Promise<Menu[]> {
  return apiGet<Menu[]>(withTenant("/public/pages/menus"));
}

// These endpoints require backend support. If not available, return empty arrays.
export async function fetchServices(): Promise<Service[]> {
  try {
    return await apiGet<Service[]>(withTenant("/public/services"));
  } catch {
    return [];
  }
}

type ProductsPageResponse = {
  items?: Product[];
  data?: Product[];
  results?: Product[];
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
  limit?: number;
};

type ProductsPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchProductsPage(params: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  query?: string;
  slug?: string;
}): Promise<ProductsPage> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(pageSize));
  if (params.categoryId && params.categoryId !== "all") {
    searchParams.set("categoryId", params.categoryId);
  }
  if (params.query) {
    searchParams.set("q", params.query);
  }
  if (params.slug) {
    searchParams.set("slug", params.slug);
  }

  try {
    const response = await apiGet<ProductsPageResponse | Product[]>(
      withTenant(`/public/products?${searchParams.toString()}`)
    );

    if (Array.isArray(response)) {
      return { items: response, total: response.length, page, pageSize };
    }

    const items = response.items || response.data || response.results || [];
    const total = response.total ?? response.count ?? items.length;
    return {
      items,
      total,
      page: response.page ?? page,
      pageSize: response.pageSize ?? response.limit ?? pageSize,
    };
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const result = await fetchProductsPage({ slug, page: 1, pageSize: 1 });
  return result.items[0] || null;
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  try {
    return await apiGet<ProductCategory[]>(withTenant("/public/products/categories"));
  } catch {
    return [];
  }
}

export async function fetchContactFormBySlug(slug: string): Promise<ContactForm | null> {
  try {
    return await apiGet<ContactForm>(withTenant(`/public/contact-forms/by-slug/${slug}`));
  } catch {
    return null;
  }
}

export async function fetchContactForms(): Promise<ContactForm[]> {
  try {
    return await apiGet<ContactForm[]>(withTenant("/public/contact-forms"));
  } catch {
    return [];
  }
}

export async function submitContactForm(formId: string, data: Record<string, any>) {
  const url = withTenant(`/public/contact-forms/${formId}/submissions`);
  const base = import.meta.env.VITE_API_BASE_URL?.toString() || "";
  const res = await fetch(`${base.replace(/\/$/, "")}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed (${res.status})`);
  }
  return res.json();
}
