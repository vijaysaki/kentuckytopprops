import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import {
  fetchContactFormBySlug,
  fetchContactForms,
  fetchMenus,
  fetchPages,
  fetchProducts,
  fetchServices,
  submitContactForm,
} from "./api/public";
import type {
  ContactForm,
  ContactFormField,
  Menu,
  Page,
  Product,
  ProductCategory,
  ProductImage,
  Service,
} from "./api/types";

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

function getImageUrlFromImage(image?: ProductImage["image"]) {
  if (!image) return "";
  return image.largeUrl || image.mediumUrl || image.spacesUrl || image.thumbnailUrl || "";
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

function getProductPath(product: Product) {
  return `/products/${product.slug || product.id}`;
}

function sortProductImages(images: ProductImage[] | undefined) {
  if (!images?.length) return [];
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function getDefaultFieldValue(field: ContactFormField) {
  if (field.type === "checkbox") return [];
  return "";
}

function ProductDetail({ products }: { products: Product[] }) {
  const { slug } = useParams();
  const product = useMemo(() => {
    if (!slug) return undefined;
    return products.find((item) => item.slug === slug || item.id === slug);
  }, [products, slug]);

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Product not found.</div>
          <Link className="btn" to="/">
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  const images = sortProductImages(product.images);

  return (
    <section className="section product-detail">
      <div className="container product-detail-grid">
        <div className="product-gallery">
          {images.length === 0 ? (
            <div className="product-image-placeholder">No images available.</div>
          ) : (
            images.map((img, index) => (
              <div key={img.image?.spacesUrl || img.image?.largeUrl || String(index)} className="product-image">
                <img
                  src={getImageUrlFromImage(img.image)}
                  alt={img.altText || img.title || product.name}
                />
              </div>
            ))
          )}
        </div>
        <div className="product-info">
          <Link className="back-link" to="/">
            ← Back to home
          </Link>
          <h1>{product.name}</h1>
          {product.shortDescription && <p className="muted">{product.shortDescription}</p>}
          {product.descriptionHtml && (
            <div className="rich" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          )}
        </div>
      </div>
    </section>
  );
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
  const [logoVisible, setLogoVisible] = useState(true);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [contactFormNote, setContactFormNote] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState<Record<string, any>>({});
  const [contactFormLoading, setContactFormLoading] = useState(true);
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [contactFormSuccess, setContactFormSuccess] = useState<string | null>(null);
  const contactPage = pages.find((p) => p.slug === "contact");

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

  const contactFormSlug = contactPage?.slug || "contact";

  useEffect(() => {
    let mounted = true;
    setContactFormLoading(true);
    fetchContactFormBySlug(contactFormSlug)
      .then(async (form) => {
        if (!mounted) return;
        let selectedForm = form;
        let note: string | null = null;
        if (!selectedForm) {
          const forms = await fetchContactForms();
          if (!mounted) return;
          selectedForm = forms[0] || null;
          if (selectedForm) {
            note = `Using "${selectedForm.name}" form. Update slug in Super Admin if needed.`;
          }
        }
        setContactForm(selectedForm || null);
        setContactFormNote(note);
        if (selectedForm?.fields?.length) {
          const initialData: Record<string, any> = {};
          selectedForm.fields.forEach((field) => {
            initialData[field.name] = getDefaultFieldValue(field);
          });
          setContactFormData(initialData);
        } else {
          setContactFormData({});
        }
      })
      .finally(() => {
        if (mounted) setContactFormLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [contactFormSlug]);

  const headerMenu = menus.find((m) => m.slug === "header") || menus[0];
  const footerMenu = menus.find((m) => m.slug === "footer");

  const heroPage = pages.find((p) => p.slug === "home") || pages[0];
  const aboutPage = pages.find((p) => p.slug === "about");
  const heroImage = useMemo(() => {
    const fromProduct = products.find((product) => getImageUrl(product));
    return fromProduct ? getImageUrl(fromProduct) : "";
  }, [products]);
  const logoSrc = "/logo.png";

  const searchableItems = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      type: "Product",
      title: product.name,
      content: product.shortDescription || product.descriptionHtml || "",
      path: getProductPath(product),
    }));
  }, [products]);

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setProductsMenuOpen(false);
    const target = document.getElementById("products");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactFieldChange = (field: ContactFormField, value: string) => {
    setContactFormData((prev) => ({ ...prev, [field.name]: value }));
  };

  const handleContactCheckboxChange = (field: ContactFormField, option: string, checked: boolean) => {
    setContactFormData((prev) => {
      const current = Array.isArray(prev[field.name]) ? (prev[field.name] as string[]) : [];
      if (checked) {
        return { ...prev, [field.name]: Array.from(new Set([...current, option])) };
      }
      return { ...prev, [field.name]: current.filter((item) => item !== option) };
    });
  };

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactForm) return;
    setContactFormSubmitting(true);
    setContactFormError(null);
    setContactFormSuccess(null);
    try {
      await submitContactForm(contactForm.id, contactFormData);
      setContactFormSuccess(contactForm.thankYouMessage || "Thanks! We received your message.");
      const next: Record<string, any> = {};
      contactForm.fields.forEach((field) => {
        next[field.name] = getDefaultFieldValue(field);
      });
      setContactFormData(next);
    } catch (err: any) {
      setContactFormError(err?.message || "Failed to submit form.");
    } finally {
      setContactFormSubmitting(false);
    }
  };

  useEffect(() => {
    if (!productsMenuOpen && !servicesMenuOpen) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".nav-item")) {
        setProductsMenuOpen(false);
        setServicesMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductsMenuOpen(false);
        setServicesMenuOpen(false);
      }
    };
    window.addEventListener("click", handleOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("click", handleOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [productsMenuOpen, servicesMenuOpen]);

  const handleSearchOpen = () => {
    setSearchOpen(true);
    setMobileMenuOpen(false);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  const handleMobileToggle = () => {
    setMobileMenuOpen((prev) => !prev);
    setSearchOpen(false);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="site">
      <header className={mobileMenuOpen ? "site-header open" : "site-header"}>
        <Link className="logo" to="/">
          {logoVisible && (
            <img
              src={logoSrc}
              alt="Kentucky Top Props"
              onError={() => setLogoVisible(false)}
            />
          )}
          <span>Kentucky Top Props</span>
        </Link>

        <div className="group">
          <ul className="navigation" aria-label="Primary navigation">
            <li>
              <Link to="/" onClick={handleMobileLinkClick}>
                Home
              </Link>
            </li>
            <li className="dropdown nav-item">
              <button
                type="button"
                onClick={() => {
                  setProductsMenuOpen((prev) => !prev);
                  setServicesMenuOpen(false);
                }}
                aria-expanded={productsMenuOpen}
              >
                Products <span className="caret" aria-hidden="true" />
              </button>
              {categories.length > 0 && (
                <ul className={productsMenuOpen ? "dropdown-menu open" : "dropdown-menu"}>
                  <li>
                    <button type="button" onClick={() => handleCategorySelect("all")}>
                      All Products
                    </button>
                  </li>
                  {categories.map((item) => (
                    <li key={item.category.id}>
                      <button type="button" onClick={() => handleCategorySelect(item.category.id)}>
                        {item.category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="dropdown nav-item">
              <button
                type="button"
                onClick={() => {
                  setServicesMenuOpen((prev) => !prev);
                  setProductsMenuOpen(false);
                }}
                aria-expanded={servicesMenuOpen}
              >
                Services <span className="caret" aria-hidden="true" />
              </button>
              <ul className={servicesMenuOpen ? "dropdown-menu open" : "dropdown-menu"}>
                <li>
                  <a href="/#services" onClick={handleMobileLinkClick}>
                    All Services
                  </a>
                </li>
                {services.map((service) => (
                  <li key={service.id}>
                    <a href="/#services" onClick={handleMobileLinkClick}>
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <a href="/#about" onClick={handleMobileLinkClick}>
                About
              </a>
            </li>
            <li>
              <a href="/#contact" onClick={handleMobileLinkClick}>
                Contact
              </a>
            </li>
            <li className="mnav" aria-hidden="true">
              <details>
                <summary>
                  Menu <span className="caret" aria-hidden="true" />
                </summary>
                <div className="mchildren">
                  <Link to="/" onClick={handleMobileLinkClick}>
                    Home
                  </Link>
                  <details>
                    <summary>
                      Products <span className="caret" aria-hidden="true" />
                    </summary>
                    <div className="mchildren">
                      <button type="button" onClick={() => handleCategorySelect("all")}>
                        All Products
                      </button>
                      {categories.map((item) => (
                        <button
                          key={item.category.id}
                          type="button"
                          onClick={() => handleCategorySelect(item.category.id)}
                        >
                          {item.category.name}
                        </button>
                      ))}
                    </div>
                  </details>
                  <details>
                    <summary>
                      Services <span className="caret" aria-hidden="true" />
                    </summary>
                    <div className="mchildren">
                      <a href="/#services" onClick={handleMobileLinkClick}>
                        All Services
                      </a>
                      {services.map((service) => (
                        <a key={service.id} href="/#services" onClick={handleMobileLinkClick}>
                          {service.name}
                        </a>
                      ))}
                    </div>
                  </details>
                  <a href="/#about" onClick={handleMobileLinkClick}>
                    About
                  </a>
                  <a href="/#contact" onClick={handleMobileLinkClick}>
                    Contact
                  </a>
                </div>
              </details>
            </li>
          </ul>

          <div className="search" aria-label="Search controls">
            <span className="icon">
              <button
                type="button"
                className={searchOpen ? "searchBtn active" : "searchBtn"}
                aria-label="Open search"
                onClick={handleSearchOpen}
              >
                🔍
              </button>
              <button
                type="button"
                className={searchOpen ? "closeBtn active" : "closeBtn"}
                aria-label="Close search"
                onClick={handleSearchClose}
              >
                ✕
              </button>
            </span>
          </div>

          <button
            type="button"
            className={searchOpen ? "menuToggle hide" : "menuToggle"}
            aria-label="Open menu"
            onClick={handleMobileToggle}
          >
            ☰
          </button>
        </div>

        <div className={searchOpen ? "searchBox active" : "searchBox"}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />
          {search && (
            <div className="search-results">
              {filteredSearch.length === 0 ? (
                <div className="search-empty">No matches</div>
              ) : (
                filteredSearch.slice(0, 8).map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    className="search-item"
                    to={item.path}
                    onClick={handleSearchClose}
                  >
                    <span className="search-type">{item.type}</span>
                    <span className="search-title">{item.title}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section className="hero" id="home">
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="hero-kicker">Kentucky Top Props</div>
              <h1>{heroPage?.title || "Production-ready props, delivered fast."}</h1>
              <div
                className="hero-text"
                dangerouslySetInnerHTML={{ __html: heroPage?.content || "Modern prop rentals for every production." }}
              />
              <div className="hero-actions">
                <a className="btn primary" href="#products">
                  Explore Catalog
                </a>
                <a className="btn" href="#services">
                  View Services
                </a>
              </div>
              <div className="hero-metrics">
                <div>
                  <strong>{products.length || 120}+</strong>
                  <span>Props</span>
                </div>
                <div>
                  <strong>{services.length || 12}+</strong>
                  <span>Services</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </div>
            </div>
            <div className="hero-media">
              {heroImage ? (
                <img src={heroImage} alt="Featured prop" />
              ) : (
                <div className="hero-card">
                  <h3>Quick Highlights</h3>
                  <ul>
                    <li>Curated props & decor</li>
                    <li>Flexible service add-ons</li>
                    <li>Modern booking experience</li>
                  </ul>
                </div>
              )}
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
                  <Link key={product.id} className="card product-card" to={getProductPath(product)}>
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
                  </Link>
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
            <div className="contact-form">
              {contactFormLoading ? (
                <div className="muted">Loading contact form...</div>
              ) : !contactForm ? (
                <div className="muted">Contact form not configured.</div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <h3>{contactForm.name}</h3>
                  {contactForm.description && <p className="muted">{contactForm.description}</p>}
                  {contactFormNote && <p className="muted">{contactFormNote}</p>}
                  <div className="form-grid">
                    {contactForm.fields.map((field) => {
                      if (field.type === "textarea") {
                        return (
                          <label key={field.name} className="form-field">
                            <span>{field.label}</span>
                            <textarea
                              required={field.required}
                              placeholder={field.placeholder}
                              value={contactFormData[field.name] || ""}
                              onChange={(e) => handleContactFieldChange(field, e.target.value)}
                            />
                          </label>
                        );
                      }
                      if (field.type === "select") {
                        return (
                          <label key={field.name} className="form-field">
                            <span>{field.label}</span>
                            <select
                              required={field.required}
                              value={contactFormData[field.name] || ""}
                              onChange={(e) => handleContactFieldChange(field, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {(field.options || []).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      }
                      if (field.type === "radio") {
                        return (
                          <fieldset key={field.name} className="form-field form-field-options">
                            <legend>{field.label}</legend>
                            {(field.options || []).map((option) => (
                              <label key={option}>
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={option}
                                  checked={contactFormData[field.name] === option}
                                  onChange={(e) => handleContactFieldChange(field, e.target.value)}
                                />
                                {option}
                              </label>
                            ))}
                          </fieldset>
                        );
                      }
                      if (field.type === "checkbox") {
                        const current = Array.isArray(contactFormData[field.name])
                          ? (contactFormData[field.name] as string[])
                          : [];
                        return (
                          <fieldset key={field.name} className="form-field form-field-options">
                            <legend>{field.label}</legend>
                            {(field.options || []).map((option) => (
                              <label key={option}>
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={current.includes(option)}
                                  onChange={(e) => handleContactCheckboxChange(field, option, e.target.checked)}
                                />
                                {option}
                              </label>
                            ))}
                          </fieldset>
                        );
                      }
                      return (
                        <label key={field.name} className="form-field">
                          <span>{field.label}</span>
                          <input
                            type={field.type || "text"}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={contactFormData[field.name] || ""}
                            onChange={(e) => handleContactFieldChange(field, e.target.value)}
                          />
                        </label>
                      );
                    })}
                  </div>
                  {contactFormError && <div className="form-error">{contactFormError}</div>}
                  {contactFormSuccess && <div className="form-success">{contactFormSuccess}</div>}
                  <button className="btn primary" type="submit" disabled={contactFormSubmitting}>
                    {contactFormSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
              </>
            }
          />
          <Route path="/products/:slug" element={<ProductDetail products={products} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-row">
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                {(footerMenu?.items || headerMenu?.items || []).slice(0, 4).map((item) => {
                  const label = item.label || item.page?.title || "Link";
                  const href = item.external_url || `#${item.page?.slug || "section"}`;
                  return (
                    <li key={item.id}>
                      <a href={href}>{label}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Get help</h4>
              <ul>
                {(footerMenu?.items || headerMenu?.items || []).slice(4, 8).map((item) => {
                  const label = item.label || item.page?.title || "Link";
                  const href = item.external_url || `#${item.page?.slug || "section"}`;
                  return (
                    <li key={item.id}>
                      <a href={href}>{label}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                {services.slice(0, 4).map((service) => (
                  <li key={service.id}>
                    <a href="/#services">{service.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Follow us</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  f
                </a>
                <a href="#" aria-label="Twitter">
                  t
                </a>
                <a href="#" aria-label="Instagram">
                  i
                </a>
                <a href="#" aria-label="LinkedIn">
                  in
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Kentucky Top Props. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
