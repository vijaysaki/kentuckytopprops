const fs = require("fs");
const path = require("path");

const API_BASE = process.env.VITE_API_BASE_URL || "https://api.adeptlogics.com";
const TENANT_ID = process.env.VITE_TENANT_ID || "48b0c409-b37b-4719-9ebd-8678f774db64";
const TENANT_DOMAIN = process.env.VITE_TENANT_DOMAIN || "kentuckytopprops.com";
const SITE_URL = process.env.VITE_SITE_URL || "https://kentuckytopprops.com";

const API_ROOT = API_BASE.replace(/\/+$/, "") + "/api/public";

function buildTenantParams() {
  const params = new URLSearchParams();
  if (TENANT_ID) {
    params.set("tenantId", TENANT_ID);
  } else if (TENANT_DOMAIN) {
    params.set("domain", TENANT_DOMAIN);
  }
  return params;
}

async function fetchJson(endpoint, extraParams) {
  const params = buildTenantParams();
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
  }
  const url = `${API_ROOT}${endpoint}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchAllProducts() {
  const items = [];
  let offset = 0;
  let total = 0;
  const limit = 100;
  do {
    const payload = await fetchJson("/products", { limit, offset });
    const pageItems = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    total = payload?.total ?? pageItems.length;
    items.push(...pageItems);
    offset += pageItems.length;
    if (!pageItems.length) break;
  } while (offset < total && offset < 1000);
  return items;
}

function normalizeCategories(payload) {
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
  return data.filter(Boolean);
}

async function fetchCategories() {
  const payload = await fetchJson("/products/categories");
  return normalizeCategories(payload);
}

function deriveCategoriesFromProducts(products) {
  const categories = new Map();
  const addCategory = (cat) => {
    if (!cat) return;
    const slug = cat.slug;
    if (!slug || categories.has(slug)) return;
    categories.set(slug, { slug });
  };

  products.forEach((product) => {
    addCategory(product.category || product.categoryInfo);
    const links = product.categoryLinks || product.categories || [];
    links.forEach((link) => addCategory(link.category || link));
  });

  return Array.from(categories.values());
}

async function fetchServices() {
  const payload = await fetchJson("/services");
  return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
}

function uniqueSlugs(items) {
  const set = new Set();
  items.forEach((item) => {
    if (item && item.slug) set.add(item.slug);
  });
  return Array.from(set.values());
}

function writeSitemap(urls) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => [
      "  <url>",
      `    <loc>${url}</loc>`,
      "    <changefreq>weekly</changefreq>",
      "  </url>"
    ].join("\n")),
    "</urlset>"
  ].join("\n");

  fs.writeFileSync(path.join(process.cwd(), "sitemap.xml"), xml);
}

async function run() {
  const urls = new Set();
  const cleanBase = SITE_URL.replace(/\/+$/, "");
  const addUrl = (pathValue) => {
    const pathClean = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
    urls.add(`${cleanBase}${pathClean}`);
  };

  addUrl("/");
  addUrl("/products");
  addUrl("/services");
  addUrl("/about");
  addUrl("/contact");

  try {
    const products = await fetchAllProducts();
    products.forEach((product) => {
      if (product?.slug) addUrl(`/products/p/${product.slug}`);
    });
    if (!products.length) {
      throw new Error("No products returned");
    }
    const derivedCategories = deriveCategoriesFromProducts(products);
    uniqueSlugs(derivedCategories).forEach((slug) => addUrl(`/products/${slug}`));
  } catch (error) {
    console.warn("[sitemap] Products fetch failed:", error.message);
  }

  try {
    const categories = await fetchCategories();
    uniqueSlugs(categories).forEach((slug) => addUrl(`/products/${slug}`));
  } catch (error) {
    console.warn("[sitemap] Categories fetch failed:", error.message);
  }

  try {
    const services = await fetchServices();
    uniqueSlugs(services).forEach((slug) => addUrl(`/services/${slug}`));
  } catch (error) {
    console.warn("[sitemap] Services fetch failed:", error.message);
  }

  writeSitemap(Array.from(urls.values()));
  console.log(`[sitemap] Generated ${urls.size} URLs`);
}

run().catch((error) => {
  console.error("[sitemap] Failed:", error);
  process.exit(1);
});
