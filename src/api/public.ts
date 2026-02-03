import { apiGet, withTenant } from "./client";
import type { ContactForm, Menu, Page, Product, Service } from "./types";

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

export async function fetchProducts(): Promise<Product[]> {
  try {
    return await apiGet<Product[]>(withTenant("/public/products"));
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
