import {
  fetchProductsForCategory,
  fetchProductBySlug,
  getTenantQueryParams
} from "./api.js";
import { productsCatalogCache, ensureProductsLoaded } from "./menu.js";

function flattenTreeItemsLocal(items, acc = []) {
  items.forEach((item) => {
    acc.push(item);
    if (item.children && item.children.length) flattenTreeItemsLocal(item.children, acc);
  });
  return acc;
}

export function getProductDescription(product, maxWords) {
  if (product.shortDescription && product.shortDescription.trim()) {
    const words = product.shortDescription.trim().split(/\s+/);
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "…"
      : product.shortDescription.trim();
  }
  const html = product.descriptionHtml || product.description || "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "…" : text;
}

export function renderProductCard(product) {
  const description = getProductDescription(product, 25);
  const imgUrl =
    product.previewThumbnailUrl ||
    product.previewImageUrl ||
    (product.images &&
      product.images[0] &&
      (product.images[0].image?.thumbnailUrl ||
        product.images[0].image?.mediumUrl ||
        product.images[0].image?.spacesUrl));
  const productUrl = product.slug ? `/products/p/${product.slug}` : null;
  const cardContent = `
    ${imgUrl ? `<div class="aspect-square overflow-hidden rounded-t-lg bg-slate-100"><img src="${imgUrl}" alt="${(product.previewAltText || product.name || "").replace(/"/g, "&quot;")}" class="w-full h-full object-cover" loading="lazy" /></div>` : ""}
    <div class="p-4">
      <h4 class="text-base font-semibold text-slate-800">${product.name || "Untitled Product"}</h4>
      ${description ? `<p class="mt-1 text-sm text-slate-600">${description}</p>` : ""}
    </div>
  `;
  return `<article class="border border-slate-200 rounded-lg bg-white overflow-hidden">${productUrl ? `<a href="${productUrl}" class="block">${cardContent}</a>` : cardContent}</article>`;
}

export function renderProductDetail(product) {
  const fullHtml = product.descriptionHtml || "";
  const imgs = (product.images || [])
    .filter((pi) => pi && pi.image)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(
      (pi) =>
        pi.image.mediumUrl || pi.image.largeUrl || pi.image.spacesUrl || pi.image.thumbnailUrl
    )
    .filter(Boolean);
  const mainImg =
    product.previewImageUrl || product.previewThumbnailUrl || imgs[0];
  const allImgs =
    mainImg && !imgs.includes(mainImg)
      ? [mainImg, ...imgs]
      : imgs.length
        ? imgs
        : mainImg
          ? [mainImg]
          : [];
  const alts = (product.images || [])
    .filter((pi) => pi && pi.image)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((pi) =>
      (pi.altText || pi.image?.altText || product.name || "").replace(/"/g, "&quot;")
    );
  const alt = (product.previewAltText || product.name || "").replace(/"/g, "&quot;");

  const colCount = 4;
  const cols = Array.from({ length: colCount }, () => []);
  allImgs.forEach((url, i) => cols[i % colCount].push({ url, alt: alts[i] || alt }));

  const masonryGallery = allImgs.length
    ? `
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4" id="product-gallery">
        ${cols
          .map(
            (colImgs) => `
          <div class="grid gap-4">
            ${colImgs
              .map(
                (item) => `
              <button type="button" class="product-gallery-img block w-full rounded-lg overflow-hidden bg-slate-100 text-left cursor-pointer hover:opacity-90 transition-opacity" data-src="${item.url.replace(/"/g, "&quot;")}">
                <img src="${item.url}" alt="${item.alt}" class="h-auto w-full max-w-full object-cover object-center" loading="lazy" />
              </button>
            `
              )
              .join("")}
          </div>
        `
          )
          .join("")}
      </div>
      <div id="product-gallery-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer hidden" tabindex="-1" data-gallery-backdrop>
        <button type="button" class="product-gallery-close absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer" aria-label="Close">✕</button>
        <div class="cursor-default" onclick="event.stopPropagation()"><img id="product-gallery-modal-img" src="" alt="" class="max-h-[90vh] max-w-full rounded-lg object-contain" /></div>
      </div>
    `
    : "";

  return `
    <p class="mb-4"><a href="/products" class="text-blue-600 hover:underline">← Back to Products</a></p>
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div class="order-2 lg:order-1">${masonryGallery}</div>
      <div class="order-1 lg:order-2">
        <h2 class="text-2xl font-bold text-slate-800">${product.name || "Untitled Product"}</h2>
        ${product.shortDescription ? `<p class="mt-3 text-slate-600">${product.shortDescription}</p>` : ""}
        ${fullHtml ? `<div class="mt-6 prose prose-slate max-w-none">${fullHtml}</div>` : ""}
      </div>
    </div>
  `;
}

export function renderProductItemsGrid(products, total, category, nextOffset) {
  if (!Array.isArray(products)) products = [];
  const hasMore = total > products.length;
  const countText =
    total > 0
      ? `Showing ${products.length} of ${total} products`
      : "No products found in this category.";

  return `
    <section class="mt-6" id="products-section">
      <h3 class="text-lg font-semibold text-slate-800">Products</h3>
      <p class="mt-1 text-sm text-slate-600" id="products-count">${countText}</p>
      <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="products-grid">
        ${products.map((p) => renderProductCard(p)).join("")}
      </div>
      ${hasMore ? `
        <div class="mt-4" id="products-load-more-wrap">
          <button
            type="button"
            data-products-load-more
            data-category-slug="${(category?.slug || "").replace(/"/g, "&quot;")}"
            data-category-id="${(category?.id || "").replace(/"/g, "&quot;")}"
            data-next-offset="${nextOffset}"
            data-total="${total}"
            class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Load more
          </button>
        </div>
      ` : ""}
    </section>
  `;
}

function renderItemDetail(item, basePath, childLabel) {
  const children = Array.isArray(item.children) ? item.children : [];
  return `
    <article class="space-y-4">
      <div class="text-slate-700">${item.content || item.description || "No content available."}</div>
      ${
        children.length
          ? `
        <section>
          <h3 class="text-lg font-semibold text-slate-800">${childLabel}</h3>
          <ul class="mt-2 space-y-2">
            ${children
              .map(
                (child) => `
              <li>
                <a href="${basePath}/${child.slug || ""}" class="text-blue-700 hover:underline">${child.name}</a>
              </li>
            `
              )
              .join("")}
          </ul>
        </section>
      `
          : ""
      }
    </article>
  `;
}

function renderCollectionCards(title, items, basePath) {
  if (!Array.isArray(items) || !items.length) {
    return `<p class="text-slate-600">No ${title.toLowerCase()} available.</p>`;
  }

  if (basePath === "/products") {
    return `
      <div class="mt-6 border border-slate-200 rounded-xl overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          ${items
            .map(
              (item, index) => `
                <a
                  href="${basePath}/${item.slug || ""}"
                  class="group block p-5 bg-white hover:bg-slate-50 transition border-slate-200
                    ${index % 3 !== 2 ? "lg:border-r" : ""}
                    ${index % 2 !== 1 ? "sm:border-r lg:border-r" : "lg:border-r-0"}
                    ${index >= items.length - (items.length % 3 || 3) ? "" : "lg:border-b"}
                    ${index < items.length - 2 ? "sm:border-b" : ""}"
                >
                  <div class="aspect-[4/3] w-full rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    Product
                  </div>
                  <h3 class="mt-4 text-base font-semibold text-slate-800 group-hover:text-blue-700">
                    ${item.name}
                  </h3>
                  <p class="mt-1 text-sm text-slate-600 line-clamp-3">
                    ${item.description || "Explore details for this product category."}
                  </p>
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      ${items
        .map(
          (item) => `
            <a href="${basePath}/${item.slug || ""}" class="block border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
              <h3 class="text-lg font-semibold text-slate-800">${item.name}</h3>
              <p class="mt-1 text-sm text-slate-600">${item.description || "No description available."}</p>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

export function bindProductsLoadMore() {
  const btn = document.querySelector("[data-products-load-more]");
  if (!btn) return;
  btn.addEventListener("click", async function () {
    const slug = this.getAttribute("data-category-slug") || "";
    const id = this.getAttribute("data-category-id") || "";
    const nextOffset = parseInt(this.getAttribute("data-next-offset") || "0", 10);
    const total = parseInt(this.getAttribute("data-total") || "0", 10);
    const gridEl = document.getElementById("products-grid");
    const countEl = document.getElementById("products-count");
    const wrapEl = document.getElementById("products-load-more-wrap");
    if (!gridEl || !countEl) return;

    this.disabled = true;
    this.textContent = "Loading…";
    try {
      const { items } = await fetchProductsForCategory({ slug, id }, nextOffset);
      items.forEach((p) => {
        gridEl.insertAdjacentHTML("beforeend", renderProductCard(p));
      });
      const newCount = gridEl.querySelectorAll("article").length;
      countEl.textContent = `Showing ${newCount} of ${total} products`;
      this.setAttribute("data-next-offset", String(nextOffset + items.length));
      if (newCount >= total && wrapEl) wrapEl.remove();
      else {
        this.disabled = false;
        this.textContent = "Load more";
      }
    } catch {
      this.disabled = false;
      this.textContent = "Load more";
    }
  });
}

export async function hydrateProductsRoute(segments) {
  await ensureProductsLoaded();
  const titleEl = document.getElementById("content-title");
  const bodyEl = document.getElementById("content-body");
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = "Products";

  if (segments[0] === "p" && segments[1]) {
    const productSlug = segments[1];
    try {
      const product = await fetchProductBySlug(productSlug);
      titleEl.textContent = product.name || "Product";
      bodyEl.innerHTML = renderProductDetail(product);
    } catch {
      titleEl.textContent = "Product not found";
      bodyEl.innerHTML = `<p class="text-slate-600 mt-4">This product could not be found.</p>`;
    }
    return;
  }

  if (!segments.length) {
    bodyEl.innerHTML = renderCollectionCards("Products", productsCatalogCache, "/products");
    return;
  }

  const slug = (segments[segments.length - 1] || segments[0] || "").toLowerCase();
  const allItems = flattenTreeItemsLocal(productsCatalogCache);
  const matched = allItems.find((item) => String(item.slug || "").toLowerCase() === slug);
  if (!matched) {
    bodyEl.innerHTML = `<p class="text-slate-600">Product category not found.</p>`;
    return;
  }

  titleEl.textContent = matched.name || "Products";
  let productsMarkup = "";
  try {
    const { items: productItems, total } = await fetchProductsForCategory(matched);
    const nextOffset = productItems.length;
    productsMarkup = renderProductItemsGrid(productItems, total, matched, nextOffset);
  } catch (error) {
    productsMarkup = `<p class="text-slate-500 mt-4">Unable to load products for this category right now.</p>`;
  }

  bodyEl.innerHTML = `${renderItemDetail(matched, "/products", "Subcategories")}${productsMarkup}`;
  bindProductsLoadMore();
}
