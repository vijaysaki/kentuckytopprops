import { apiGet, withTenant } from "./client";
import type { Menu, Page, Product, Service } from "./types";

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
