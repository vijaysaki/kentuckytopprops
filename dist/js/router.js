import { hydrateProductsRoute } from "./products.js";
import { hydrateServicesRoute } from "./services.js";
import { loadPageFromApi, renderPageContent } from "./pages.js";
import { fetchContactFormForRoute } from "./api.js";
import { renderContactForm, bindContactFormSubmission } from "./contact.js";

export function closeAllMenus() {
  const ids = ["products-dropdown", "services-dropdown"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains("hidden")) {
      el.classList.add("hidden");
    }
  });
  document.querySelectorAll('[id^="submenu-"]').forEach((el) => {
    el.classList.add("hidden");
  });
}

export async function hydratePageFromPathname(pathname = window.location.pathname) {
  const normalized = String(pathname || "/").replace(/^\/+|\/+$/g, "").toLowerCase();
  const segments = normalized ? normalized.split("/") : [];
  const pageKey = segments[0] || "home";

  if (pageKey === "products") {
    await hydrateProductsRoute(segments.slice(1));
    return;
  }

  if (pageKey === "services") {
    await hydrateServicesRoute(segments.slice(1));
    return;
  }

  const page = await loadPageFromApi(pageKey);
  if (page) {
    renderPageContent(page);
  } else {
    const titleEl = document.getElementById("content-title");
    const bodyEl = document.getElementById("content-body");
    if (titleEl) titleEl.textContent = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
    if (bodyEl) bodyEl.innerHTML = "";
  }

  if (pageKey === "contact") {
    const form = await fetchContactFormForRoute("contact");
    if (form) {
      const bodyEl = document.getElementById("content-body");
      if (bodyEl) {
        bodyEl.innerHTML = `${bodyEl.innerHTML}${renderContactForm(form)}`;
        bindContactFormSubmission();
      }
    }
  }
}

export function bindCmsPageNavigation() {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const galleryImg = target.closest(".product-gallery-img");
    if (galleryImg) {
      const src = galleryImg.getAttribute("data-src");
      const modal = document.getElementById("product-gallery-modal");
      const modalImg = document.getElementById("product-gallery-modal-img");
      if (src && modal && modalImg) {
        modalImg.src = src;
        modalImg.alt = galleryImg.querySelector("img")?.alt || "";
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
      return;
    }
    const galleryClose = target.closest(".product-gallery-close");
    const galleryBackdrop = target.closest("[data-gallery-backdrop]");
    if (galleryClose || (galleryBackdrop && target === galleryBackdrop)) {
      const modal = document.getElementById("product-gallery-modal");
      if (modal) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
      }
      return;
    }
    const link = target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("/") || href.startsWith("//")) return;
    if (link.hasAttribute("download") || link.getAttribute("target") === "_blank") return;

    event.preventDefault();
    closeAllMenus();
    history.pushState({}, "", href);
    await hydratePageFromPathname(href);
  });

  window.addEventListener("popstate", async () => {
    await hydratePageFromPathname(window.location.pathname);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("product-gallery-modal");
      if (modal && !modal.classList.contains("hidden")) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
      }
    }
  });
}
