import { apiGet, withTenant } from "./client";
import type { ContactForm, Menu, Page, Product, ProductCategory, Service } from "./types";

export async function fetchPages(): Promise<Page[]> {
  return apiGet<Page[]>(withTenant("/public/pages"));
}

export async function fetchMenus(): Promise<Menu[]> {
  return apiGet<Menu[]>(withTenant("/public/pages/menus"));
}

// These endpoints require backend support. If not available, return empty arrays.
function flattenServicesTree(nodes: Service[] | undefined, parentId?: string | null): Service[] {
  if (!nodes?.length) return [];
  const result: Service[] = [];
  nodes.forEach((node) => {
    const normalized: Service = parentId && !node.parentId ? { ...node, parentId } : node;
    result.push(normalized);
    if (node.children?.length) {
      result.push(...flattenServicesTree(node.children, node.id));
    }
  });
  return result;
}

export function flattenCategoryTree(
  nodes: ProductCategory[] | undefined,
  parentId?: string | null
): ProductCategory[] {
  if (!nodes?.length) return [];
  const result: ProductCategory[] = [];
  nodes.forEach((node) => {
    const normalized: ProductCategory = parentId && !node.parentId ? { ...node, parentId } : node;
    result.push(normalized);
    if (node.children?.length) {
      result.push(...flattenCategoryTree(node.children, node.id));
    }
  });
  return result;
}

export async function fetchServicesTree(): Promise<Service[]> {
  try {
    const response = await apiGet<any>(withTenant("/public/services/tree"));
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.results)) return response.results;
    return [];
  } catch {
    return apiGet<Service[]>(withTenant("/public/services"));
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const tree = await fetchServicesTree();
    return flattenServicesTree(tree);
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
  categorySlug?: string;
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
  if (params.categorySlug) {
    searchParams.set("categorySlug", params.categorySlug);
    searchParams.set("category", params.categorySlug);
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

export async function fetchProductById(productId: string): Promise<Product | null> {
  // Accept domain as parameter
  try {
    const domain = arguments.length > 1 ? arguments[1] : undefined;
    const domainParam = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    const response = await apiGet<Product>(
      withTenant(`/public/products/${productId}${domainParam}`)
    );
    return response || null;
  } catch {
    return null;
  }
}

export async function fetchProductCategoriesFromProducts(options?: {
  pageSize?: number;
  maxPages?: number;
}): Promise<ProductCategory[]> {
  const pageSize = options?.pageSize ?? 100;
  const maxPages = options?.maxPages ?? 50;
  const categories = new Map<string, ProductCategory>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    const result = await fetchProductsPage({ page, pageSize });
    const items = result.items || [];

    items.forEach((product) => {
      if (product.category?.id) {
        categories.set(product.category.id, product.category);
      }
      (product.categoryLinks || []).forEach((link) => {
        if (link.category?.id) {
          categories.set(link.category.id, link.category);
        }
      });
    });

    const resultPageSize = result.pageSize || pageSize;
    totalPages = resultPageSize ? Math.ceil((result.total || 0) / resultPageSize) : 1;
    if (items.length === 0) break;
    page += 1;
  }

  return Array.from(categories.values());
}

export async function fetchProductCategoriesTree(): Promise<ProductCategory[]> {
  try {
    const response = await apiGet<any>(withTenant("/public/products/categories"));
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.results)) return response.results;
    return [];
  } catch {
    return [];
  }
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  try {
    const tree = await fetchProductCategoriesTree();
    if (tree.length) return flattenCategoryTree(tree);
    return fetchProductCategoriesFromProducts();
  } catch {
    return fetchProductCategoriesFromProducts();
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
