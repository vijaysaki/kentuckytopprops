import { servicesCatalogCache, ensureServicesLoaded } from "./menu.js";

function flattenTreeItems(items, acc = []) {
  items.forEach((item) => {
    acc.push(item);
    if (item.children && item.children.length) flattenTreeItems(item.children, acc);
  });
  return acc;
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

export async function hydrateServicesRoute(segments) {
  await ensureServicesLoaded();
  const titleEl = document.getElementById("content-title");
  const bodyEl = document.getElementById("content-body");
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = "Services";
  if (!segments.length) {
    bodyEl.innerHTML = renderCollectionCards("Services", servicesCatalogCache, "/services");
    return;
  }

  const slug = segments[0].toLowerCase();
  const allItems = flattenTreeItems(servicesCatalogCache);
  const matched = allItems.find((item) => String(item.slug || "").toLowerCase() === slug);
  if (!matched) {
    bodyEl.innerHTML = `<p class="text-slate-600">Service not found.</p>`;
    return;
  }

  titleEl.textContent = matched.name || "Services";
  bodyEl.innerHTML = renderItemDetail(matched, "/services", "Related services");
}
