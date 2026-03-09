import { getPagesCache, getTenantQueryParams } from "./api.js";
import {
  productsCatalogCache,
  servicesCatalogCache,
  ensureProductsLoaded,
  ensureServicesLoaded
} from "./menu.js";
import {
  API_BASE_URL,
  PRODUCTS_LIST_ENDPOINT,
  BLOGS_ENDPOINT
} from "./config.js";

const SEARCH_SECTION_ORDER = ["Products", "Services", "Pages", "Blogs", "Main"];

export let searchIndexCache = [];

function flattenForSearch(items, sectionName, acc = []) {
  items.forEach((item) => {
    acc.push({
      label: item.name,
      url: item.url || (item.slug ? `/${item.slug}` : ""),
      section: sectionName
    });
    if (item.children && item.children.length) {
      flattenForSearch(item.children, sectionName, acc);
    }
  });
  return acc;
}

function renderSearchResults(targetEl, results, query) {
  if (!results.length) {
    targetEl.classList.add("hidden");
    targetEl.innerHTML = "";
    targetEl.previousElementSibling?.setAttribute?.("aria-expanded", "false");
    return;
  }
  const bySection = {};
  results.forEach((item) => {
    if (!bySection[item.section]) bySection[item.section] = [];
    bySection[item.section].push(item);
  });
  targetEl.innerHTML = SEARCH_SECTION_ORDER.filter((s) => bySection[s]?.length)
    .map((section) => {
      const items = bySection[section].slice(0, section === "Products" ? 12 : 6);
      return `
        <div class="py-2">
          <div class="px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">${section}</div>
          ${items
            .map(
              (item) => `
            <a href="${item.url}" class="flex items-center gap-x-3 py-2 px-3 rounded-lg hover:bg-slate-100 focus:outline-none focus:bg-slate-100">
              <span class="text-sm text-slate-800">${item.label}</span>
              <span class="ml-auto text-xs text-slate-500">${item.section}</span>
            </a>
          `
            )
            .join("")}
        </div>
      `;
    })
    .join("");
  targetEl.classList.remove("hidden");
  targetEl.previousElementSibling?.setAttribute?.("aria-expanded", "true");
}

function hideSearchResults(resultsEl) {
  resultsEl.classList.add("hidden");
  const inputId =
    resultsEl.id === "search-results-mobile" ? "menu-search-mobile" : "menu-search";
  const input = document.getElementById(inputId);
  if (input) input.setAttribute("aria-expanded", "false");
}

export function bindSearch(inputId, resultsId, getAllItems) {
  const inputEl = document.getElementById(inputId);
  const resultsEl = document.getElementById(resultsId);
  if (!inputEl || !resultsEl) return;

  const search = () => {
    const query = inputEl.value.trim().toLowerCase();
    const allItems = getAllItems();
    if (!query) {
      renderSearchResults(resultsEl, [], query);
      return;
    }
    const filtered = allItems.filter(
      (item) =>
        (item.label || "").toLowerCase().includes(query) ||
        (item.url || "").toLowerCase().includes(query) ||
        (item.section || "").toLowerCase().includes(query)
    );
    renderSearchResults(resultsEl, filtered, query);
  };

  inputEl.addEventListener("input", search);
  inputEl.addEventListener("focus", () => {
    if (inputEl.value.trim()) search();
  });

  document.addEventListener("click", (event) => {
    if (!resultsEl.contains(event.target) && event.target !== inputEl) {
      hideSearchResults(resultsEl);
    }
  });
}

export async function buildSearchIndex() {
  const homeHref = "/";
  const aboutHref = "/about";
  const contactHref = "/contact";
  const items = [
    { label: "Home", url: homeHref, section: "Main" },
    { label: "About", url: aboutHref, section: "Main" },
    { label: "Contact", url: contactHref, section: "Main" }
  ];

  try {
    const pages = await getPagesCache();
    (pages || []).forEach((p) => {
      const path = (p.full_path || p.fullPath || p.slug || "").replace(/^\/+/, "") || "home";
      items.push({
        label: p.title || p.name || path,
        url: path ? `/${path}` : "/",
        section: "Pages"
      });
    });
  } catch (_) {}

  try {
    await ensureProductsLoaded();
    flattenForSearch(productsCatalogCache, "Products", items);
    const params = getTenantQueryParams();
    const prodRes = await fetch(
      `${API_BASE_URL}${PRODUCTS_LIST_ENDPOINT}?${params.toString()}&limit=100`
    );
    if (prodRes.ok) {
      const data = await prodRes.json();
      const prods = data?.items || [];
      prods.forEach((p) =>
        items.push({
          label: p.name,
          url: p.slug ? `/products/p/${p.slug}` : `/products`,
          section: "Products"
        })
      );
    }
  } catch (_) {}

  try {
    await ensureServicesLoaded();
    flattenForSearch(servicesCatalogCache, "Services", items);
  } catch (_) {}

  try {
    const params = getTenantQueryParams();
    const blogRes = await fetch(
      `${API_BASE_URL}${BLOGS_ENDPOINT}?${params.toString()}&limit=50`
    );
    if (blogRes.ok) {
      const data = await blogRes.json();
      const posts = data?.items || data || [];
      posts.forEach((p) =>
        items.push({
          label: p.title || p.name,
          url: p.slug ? `/blog/${p.slug}` : "#",
          section: "Blogs"
        })
      );
    }
  } catch (_) {}

  searchIndexCache = items;
  return items;
}
