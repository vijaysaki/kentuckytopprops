import { fetchMenuData } from "./api.js";
import {
  PRODUCTS_ENDPOINT,
  SERVICES_ENDPOINT,
  fallbackProducts,
  fallbackServices
} from "./config.js";

export let productsCatalogCache = [];
export let servicesCatalogCache = [];
export let productsMenuRendered = false;
export let servicesMenuRendered = false;

let submenuCounter = 0;

function slugFromUrl(url) {
  if (!url || typeof url !== "string") return "";
  const path = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "");
  const segments = path.split("/").filter(Boolean);
  return (segments[segments.length - 1] || "").toLowerCase();
}

function buildTreeFromParent(items) {
  const byId = new Map();
  const roots = [];

  items.forEach((item) => {
    byId.set(item.id, { ...item, children: [] });
  });

  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId).children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

function adaptProductCategoriesToMenu(categories) {
  if (!Array.isArray(categories)) return [];
  const hasParentStructure = categories.some((item) => item && (item.id || item.parentId));
  const tree = hasParentStructure ? buildTreeFromParent(categories) : categories;
  const mapNode = (node) => {
    const slug = node.slug || slugFromUrl(node.url) || "";
    return {
      id: node.id || "",
      slug,
      name: node.name || "Untitled",
      description: node.description || "",
      content: node.content || "",
      url: slug ? `/products/${slug}` : "/products",
      children: (node.children || []).map(mapNode)
    };
  };
  return tree.map(mapNode);
}

function adaptServicesToMenu(services) {
  if (!Array.isArray(services)) return [];
  const maybeTree =
    services.some((s) => Array.isArray(s.children) && s.children.length > 0)
      ? services
      : services.some((s) => s && (s.id || s.parentId))
        ? buildTreeFromParent(services)
        : services;

  const mapNode = (node) => ({
    id: node.id || "",
    slug: node.slug || "",
    name: node.name || "Untitled",
    description: node.description || "",
    content: node.content || "",
    url: node.slug ? `/services/${node.slug}` : "/services",
    children: (node.children || []).map(mapNode)
  });
  return maybeTree.map(mapNode);
}

export async function ensureProductsLoaded() {
  if (productsCatalogCache.length) return productsCatalogCache;
  const rawProducts = await fetchMenuData(PRODUCTS_ENDPOINT, fallbackProducts);
  productsCatalogCache = adaptProductCategoriesToMenu(rawProducts);
  return productsCatalogCache;
}

export async function ensureServicesLoaded() {
  if (servicesCatalogCache.length) return servicesCatalogCache;
  const rawServices = await fetchMenuData(SERVICES_ENDPOINT, fallbackServices);
  servicesCatalogCache = adaptServicesToMenu(rawServices);
  return servicesCatalogCache;
}

export function renderNestedMenu(items) {
  return items
    .map((item) => {
      if (item.children && item.children.length > 0) {
        submenuCounter += 1;
        const submenuId = `submenu-${submenuCounter}`;
        return `
          <li class="relative">
            <button data-submenu-target="${submenuId}" class="submenu-toggle w-full flex items-center justify-between p-2 rounded hover:bg-slate-100 text-left text-slate-800">
              <span>${item.name}</span>
              <svg class="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
              </svg>
            </button>
            <div id="${submenuId}" class="hidden md:absolute md:top-0 md:left-full md:ml-1 bg-white border border-slate-200 rounded-lg shadow-xl min-w-56 z-30 mt-1 md:mt-0">
              <ul class="p-2 text-slate-800">
                ${renderNestedMenu(item.children)}
              </ul>
            </div>
          </li>
        `;
      }
      return `
        <li>
          <a href="${item.url}" class="block p-2 rounded hover:bg-slate-100 text-slate-800">${item.name}</a>
        </li>
      `;
    })
    .join("");
}

export function bindSubmenuToggles() {
  document.querySelectorAll(".submenu-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const targetId = button.getAttribute("data-submenu-target");
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (targetEl) {
        targetEl.classList.toggle("hidden");
      }
    });
  });
}

export async function renderProductsMenuIfNeeded() {
  if (productsMenuRendered) return;
  const products = await ensureProductsLoaded();
  const productsDesktopEl = document.getElementById("products-menu-desktop");
  if (productsDesktopEl) productsDesktopEl.innerHTML = renderNestedMenu(products);
  bindSubmenuToggles();
  productsMenuRendered = true;
}

export async function renderServicesMenuIfNeeded() {
  if (servicesMenuRendered) return;
  const services = await ensureServicesLoaded();
  const servicesDesktopEl = document.getElementById("services-menu-desktop");
  if (servicesDesktopEl) servicesDesktopEl.innerHTML = renderNestedMenu(services);
  bindSubmenuToggles();
  servicesMenuRendered = true;
}
