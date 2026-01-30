import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { fetchMenus, fetchPages, fetchProducts, fetchServices } from "./api/public";
import type { Menu, Page, Product, ProductCategory, Service } from "./api/types";

function dollarsFromCents(cents?: string | null) {
  if (!cents) return "";
  const n = Number(cents);
  if (Number.isNaN(n)) return "";
  return (n / 100).toFixed(2);
}

function getImageUrl(p: Product) {
  const img = p.images?.[0]?.image;
  return img?.largeUrl || img?.mediumUrl || img?.spacesUrl || "";
}

function stripHtml(value?: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function getPageParentId(page: Page) {
  return page.parent_id || page.parent?.id || null;
}

function extractProductCategories(product: Product): ProductCategory[] {
  const list: ProductCategory[] = [];
  if (product.category) {
    list.push(product.category);
  }
  for (const link of product.categoryLinks || []) {
    if (link.category) list.push(link.category);
  }
  return list;
}

export default function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedServiceGroupId, setSelectedServiceGroupId] = useState("all");
  const [selectedPageGroupId, setSelectedPageGroupId] = useState("all");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchPages(), fetchMenus(), fetchServices(), fetchProducts()])
      .then(([pagesRes, menusRes, servicesRes, productsRes]) => {
        if (!mounted) return;
        setPages(pagesRes || []);
        setMenus(menusRes || []);
        setServices(servicesRes || []);
        setProducts(productsRes || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const headerMenu = menus.find((m) => m.slug === "header") || menus[0];
  const footerMenu = menus.find((m) => m.slug === "footer");

  const heroPage = pages.find((p) => p.slug === "home") || pages[0];
  const aboutPage = pages.find((p) => p.slug === "about");
  const contactPage = pages.find((p) => p.slug === "contact");

  const searchableItems = useMemo(() => {
    const pageItems = pages.map((p) => ({
      id: p.id,
      type: "Page",
      title: p.title || p.slug,
      content: p.content || "",
    }));
    const serviceItems = services.map((s) => ({
      id: s.id,
      type: "Service",
      title: s.name,
      content: s.description || "",
    }));
    const productItems = products.map((p) => ({
      id: p.id,
      type: "Product",
      title: p.name,
      content: p.shortDescription || p.descriptionHtml || "",
    }));
    return [...pageItems, ...serviceItems, ...productItems];
  }, [pages, services, products]);

  const filteredSearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return searchableItems.filter((item) => {
      const hay = `${item.title} ${item.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search, searchableItems]);

  const serviceGroups = useMemo(() => {
    return services
      .filter((service) => !service.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedServiceGroupId === "all") return services;
    return services.filter((service) => {
      return service.id === selectedServiceGroupId || service.parentId === selectedServiceGroupId;
    });
  }, [services, selectedServiceGroupId]);

  const pageGroups = useMemo(() => {
    return pages
      .filter((page) => !getPageParentId(page))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [pages]);

  const filteredPages = useMemo(() => {
    if (selectedPageGroupId === "all") return pages;
    return pages.filter((page) => {
      const parentId = getPageParentId(page);
      return page.id === selectedPageGroupId || parentId === selectedPageGroupId;
    });
  }, [pages, selectedPageGroupId]);

  const categories = useMemo(() => {
    const map = new Map<string, { category: ProductCategory; count: number }>();
    products.forEach((product) => {
      const cats = extractProductCategories(product);
      cats.forEach((cat) => {
        const existing = map.get(cat.id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(cat.id, { category: cat, count: 1 });
        }
      });
    });
    return Array.from(map.values())
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        const sortA = a.category.sortOrder ?? 0;
        const sortB = b.category.sortOrder ?? 0;
        if (sortA !== sortB) return sortA - sortB;
        return a.category.name.localeCompare(b.category.name);
      });
  }, [products]);

  useEffect(() => {
    if (selectedCategoryId === "all") return;
    const exists = categories.some((item) => item.category.id === selectedCategoryId);
    if (!exists) setSelectedCategoryId("all");
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (selectedServiceGroupId === "all") return;
    const exists = serviceGroups.some((service) => service.id === selectedServiceGroupId);
    if (!exists) setSelectedServiceGroupId("all");
  }, [serviceGroups, selectedServiceGroupId]);

  useEffect(() => {
    if (selectedPageGroupId === "all") return;
    const exists = pageGroups.some((page) => page.id === selectedPageGroupId);
    if (!exists) setSelectedPageGroupId("all");
  }, [pageGroups, selectedPageGroupId]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") return products;
    return products.filter((product) => {
      return extractProductCategories(product).some((cat) => cat.id === selectedCategoryId);
    });
  }, [products, selectedCategoryId]);

  return (
    <div className="site">
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo">Kentucky Top Props</div>
          <nav className="nav">
            {(headerMenu?.items || []).map((item) => {
              const label = item.label || item.page?.title || "Link";
              const href = item.external_url || `#${item.page?.slug || "section"}`;
              return (
                <a key={item.id} href={href}>
                  {label}
                </a>
              );
            })}
            {!headerMenu && (
              <>
                <a href="#services">Services</a>
                <a href="#products">Products</a>
                <a href="#contact">Contact</a>
              </>
            )}
          </nav>
          <div className="search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, products, pages..."
            />
            {search && (
              <div className="search-results">
                {filteredSearch.length === 0 ? (
                  <div className="search-empty">No matches</div>
                ) : (
                  filteredSearch.slice(0, 8).map((item) => (
                    <div key={`${item.type}-${item.id}`} className="search-item">
                      <span className="search-type">{item.type}</span>
                      <span className="search-title">{item.title}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="container hero-content">
            <div>
              <h1>{heroPage?.title || "Kentucky Top Props"}</h1>
              <div
                className="hero-text"
                dangerouslySetInnerHTML={{ __html: heroPage?.content || "Modern prop rentals for every production." }}
              />
              <div className="hero-actions">
                <a className="btn primary" href="#services">
                  Explore Services
                </a>
                <a className="btn" href="#products">
                  Browse Products
                </a>
              </div>
            </div>
            <div className="hero-card">
              <h3>Quick Highlights</h3>
              <ul>
                <li>Curated props & decor</li>
                <li>Flexible service add-ons</li>
                <li>Modern booking experience</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-header">
              <h2>Services</h2>
              {serviceGroups.length > 0 && (
                <div className="filter">
                  <label htmlFor="serviceFilter">Group</label>
                  <select
                    id="serviceFilter"
                    value={selectedServiceGroupId}
                    onChange={(e) => setSelectedServiceGroupId(e.target.value)}
                  >
                    <option value="all">All services</option>
                    {serviceGroups.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {loading ? (
              <div className="muted">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="muted">No services found yet.</div>
            ) : filteredServices.length === 0 ? (
              <div className="muted">No services found in this group.</div>
            ) : (
              <div className="grid">
                {filteredServices.map((service) => (
                  <div key={service.id} className="card">
                    <h3>{service.name}</h3>
                    <p>{service.description || "Custom service tailored for your project."}</p>
                    <div className="meta">
                      {service.durationMinutes ? `${service.durationMinutes} min` : "Custom duration"}
                      {service.basePriceCents ? ` • $${dollarsFromCents(service.basePriceCents)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section alt" id="products">
          <div className="container">
            <div className="section-header">
              <h2>Products</h2>
              {categories.length > 0 && (
                <div className="filter">
                  <label htmlFor="productFilter">Category</label>
                  <select
                    id="productFilter"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="all">All categories</option>
                    {categories.map((item) => (
                      <option key={item.category.id} value={item.category.id}>
                        {item.category.name} ({item.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {loading ? (
              <div className="muted">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="muted">No products found yet.</div>
            ) : filteredProducts.length === 0 ? (
              <div className="muted">No products found in this category.</div>
            ) : (
              <div className="grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card">
                    {getImageUrl(product) && (
                      <div className="card-image">
                        <img src={getImageUrl(product)} alt={product.name} />
                      </div>
                    )}
                    <h3>{product.name}</h3>
                    <p>{product.shortDescription || "Signature prop from the catalog."}</p>
                    {product.priceCents && (
                      <div className="meta">
                        {product.currency || "USD"} {dollarsFromCents(product.priceCents)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section" id="pages">
          <div className="container">
            <div className="section-header">
              <h2>Pages</h2>
              {pageGroups.length > 0 && (
                <div className="filter">
                  <label htmlFor="pageFilter">Group</label>
                  <select
                    id="pageFilter"
                    value={selectedPageGroupId}
                    onChange={(e) => setSelectedPageGroupId(e.target.value)}
                  >
                    <option value="all">All pages</option>
                    {pageGroups.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title || page.slug}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {loading ? (
              <div className="muted">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="muted">No pages found yet.</div>
            ) : filteredPages.length === 0 ? (
              <div className="muted">No pages found in this group.</div>
            ) : (
              <div className="grid">
                {filteredPages.map((page) => (
                  <div key={page.id} className="card">
                    <h3>{page.title || page.slug}</h3>
                    <p>{stripHtml(page.content || "").slice(0, 140) || "No content available yet."}</p>
                    {page.full_path && <div className="meta">{page.full_path}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <h2>About</h2>
            <div
              className="rich"
              dangerouslySetInnerHTML={{ __html: aboutPage?.content || "Tell your story here." }}
            />
          </div>
        </section>

        <section className="section alt" id="contact">
          <div className="container">
            <h2>Contact</h2>
            <div
              className="rich"
              dangerouslySetInnerHTML={{ __html: contactPage?.content || "Contact us to book your next production." }}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="logo">Kentucky Top Props</div>
            <p className="muted">Modern prop rentals and production support.</p>
          </div>
          <div className="footer-links">
            {(footerMenu?.items || headerMenu?.items || []).map((item) => {
              const label = item.label || item.page?.title || "Link";
              const href = item.external_url || `#${item.page?.slug || "section"}`;
              return (
                <a key={item.id} href={href}>
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
