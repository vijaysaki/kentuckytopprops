import { getPagesCache } from "./api.js";

export async function loadPageFromApi(pathOrSlug) {
  try {
    const pages = await getPagesCache();
    if (!Array.isArray(pages) || pages.length === 0) return null;

    const normalized = String(pathOrSlug || "")
      .replace(/^\/+/, "")
      .toLowerCase();

    const page = pages.find((item) => {
      const fullPath = String(item?.full_path || item?.fullPath || "")
        .replace(/^\/+/, "")
        .toLowerCase();
      const slug = String(item?.slug || "")
        .replace(/^\/+/, "")
        .toLowerCase();
      if (normalized === "home" || normalized === "") {
        return (
          fullPath === "" || fullPath === "home" || slug === "home" || slug === ""
        );
      }
      return fullPath === normalized || slug === normalized;
    });
    return page || null;
  } catch (error) {
    console.warn("Unable to load page content from API", error);
    return null;
  }
}

export function renderPageContent(page) {
  const titleEl = document.getElementById("content-title");
  const bodyEl = document.getElementById("content-body");
  if (!titleEl || !bodyEl || !page) return;

  const title = page.title || page.name || "Page";
  const content = page.content || page.body || "";

  titleEl.textContent = title;
  bodyEl.innerHTML = content.trim()
    ? content
    : '<p class="text-slate-600">No content available for this page.</p>';
}
