import { bindCmsPageNavigation, hydratePageFromPathname } from "./router.js";
import { renderProductsMenuIfNeeded, renderServicesMenuIfNeeded } from "./menu.js";
import { bindSearch, buildSearchIndex, searchIndexCache } from "./search.js";

let cmsNavigationBound = false;

async function initNavbarMenus() {
  const aboutLinkEl = document.getElementById("about-link");
  const homeLinkEl = document.getElementById("home-link");
  const contactLinkEl = document.getElementById("contact-link");
  const homeHref = "/";
  const aboutHref = "/about";
  const contactHref = "/contact";

  if (homeLinkEl) homeLinkEl.setAttribute("href", homeHref);
  if (aboutLinkEl) aboutLinkEl.setAttribute("href", aboutHref);
  if (contactLinkEl) contactLinkEl.setAttribute("href", contactHref);

  if (!cmsNavigationBound) {
    cmsNavigationBound = true;
    bindCmsPageNavigation();
  }

  const productsDropdownButton = document.getElementById("products-dropdown-button");
  const servicesDropdownButton = document.getElementById("services-dropdown-button");
  if (productsDropdownButton) {
    productsDropdownButton.addEventListener("click", () => void renderProductsMenuIfNeeded());
  }
  if (servicesDropdownButton) {
    servicesDropdownButton.addEventListener("click", () => void renderServicesMenuIfNeeded());
  }

  bindSearch("menu-search", "search-results", () => searchIndexCache);
  bindSearch("menu-search-mobile", "search-results-mobile", () => searchIndexCache);

  void buildSearchIndex();
  await hydratePageFromPathname(window.location.pathname);
}

initNavbarMenus();
