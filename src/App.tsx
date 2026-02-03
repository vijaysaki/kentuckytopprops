import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
import {
  fetchContactFormBySlug,
  fetchContactForms,
  fetchMenus,
  fetchPages,
  fetchProductBySlug,
  fetchProductCategoriesTree,
  fetchProductCategories,
  fetchProductsPage,
  fetchServicesTree,
  flattenCategoryTree,
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

function getCategorySlug(category?: ProductCategory | null) {
  return category?.slug || category?.id || "";
}

function getProductCategorySlug(product: Product) {
  const category = product.category || product.categoryLinks?.[0]?.category || null;
  return getCategorySlug(category);
}

function getProductPath(product: Product) {
  const categorySlug = getProductCategorySlug(product);
  const productSlug = product.slug || product.id;
  if (categorySlug) return `/products/${categorySlug}/${productSlug}`;
  return `/products/uncategorized/${productSlug}`;
}

function sortProductImages(images: ProductImage[] | undefined) {
  if (!images?.length) return [];
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function getDefaultFieldValue(field: ContactFormField) {
  if (field.type === "checkbox") return [];
  return "";
}

function flattenServicesTree(nodes: Service[] | undefined, parentId?: string | null): Service[] {
  if (!nodes?.length) return [];
  const result: Service[] = [];
  nodes.forEach((node) => {
    const normalized: Service = parentId && !node.parentId ? { ...node, parentId } : node;
    result.push(normalized);
    if (node.children?.length) {
      result.push(...flattenServicesTree(node.children, node.id));
    }
  });
  return result;
}

function buildCategoryTreeFromFlat(items: ProductCategory[]) {
  const map = new Map<string, ProductCategory>();
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  const roots: ProductCategory[] = [];
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

function buildServiceTreeFromFlat(items: Service[]) {
  const map = new Map<string, Service>();
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  const roots: Service[] = [];
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

function ProductDetail() {
  const { productSlug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!productSlug) {
      setProductLoading(false);
      return;
    }
    setProductLoading(true);
    fetchProductBySlug(productSlug)
      .then((data) => {
        if (mounted) setProduct(data);
      })
      .finally(() => {
        if (mounted) setProductLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productSlug]);

  if (productLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Loading product...</div>
        </div>
      </section>
    );
  }

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

function ProductsCategoryPage({ categories }: { categories: ProductCategory[] }) {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = 20;
  const pageParam = Number(searchParams.get("page") || "1");
  const requestedPage = Number.isFinite(pageParam) ? pageParam : 1;
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const categoryId =
    categories.find((item) => getCategorySlug(item) === categorySlug)?.id || categorySlug;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductsPage({
      page: requestedPage,
      pageSize,
      categoryId: categoryId ? categoryId : undefined,
    })
      .then((data) => {
        if (!mounted) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [categoryId, requestedPage]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const categoryName =
    categories.find((item) => getCategorySlug(item) === categorySlug)?.name || "Products";
  const basePath = categorySlug ? `/products/${categorySlug}` : "/products";

  useEffect(() => {
    if (requestedPage !== currentPage) {
      setSearchParams({ page: String(currentPage) });
    }
  }, [requestedPage, currentPage, setSearchParams]);

  return (
    <section className="section product-listing">
      <div className="container">
        <div className="section-header">
          <h2>{categoryName}</h2>
          <div className="muted">
            {total} item{total === 1 ? "" : "s"}
          </div>
        </div>
        {loading ? (
          <div className="muted">Loading products...</div>
        ) : items.length === 0 ? (
          <div className="muted">No products found in this category.</div>
        ) : (
          <>
            <div className="grid">
              {items.map((product) => (
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
            {totalPages > 1 && (
              <div className="pagination">
                <Link
                  className={currentPage === 1 ? "page-link disabled" : "page-link"}
                  to={`${basePath}?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                >
                  Prev
                </Link>
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <Link
                      key={page}
                      className={page === currentPage ? "page-link active" : "page-link"}
                      to={`${basePath}?page=${page}`}
                    >
                      {page}
                    </Link>
                  );
                })}
                <Link
                  className={currentPage === totalPages ? "page-link disabled" : "page-link"}
                  to={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}`}
                  aria-disabled={currentPage === totalPages}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ProductsIndexPage({ categories }: { categories: ProductCategory[] }) {
  if (categories.length > 0) {
    const first = getCategorySlug(categories[0]);
    if (first) return <Navigate to={`/products/${first}`} replace />;
  }
  return (
    <section className="section">
      <div className="container">
        <div className="muted">No product categories available.</div>
      </div>
    </section>
  );
}

export default function App() {
  const [pages, setPages] = useState<Page[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesTree, setServicesTree] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productCategoriesTree, setProductCategoriesTree] = useState<ProductCategory[]>([]);
  const [productCategoriesLoading, setProductCategoriesLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
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
    Promise.all([
      fetchPages(),
      fetchMenus(),
      fetchServicesTree(),
      fetchProductCategoriesTree(),
      fetchProductCategories(),
      fetchProductsPage({ page: 1, pageSize: 20 }),
    ])
      .then(
        ([
          pagesRes,
          menusRes,
          servicesTreeRes,
          categoriesTreeRes,
          categoriesFlatRes,
          productsRes,
        ]) => {
        if (!mounted) return;
        setPages(pagesRes || []);
        setMenus(menusRes || []);
        const nextServicesTree: Service[] = servicesTreeRes || [];
        const hasServiceChildren = nextServicesTree.some((service) => service.children?.length);
        const normalizedServicesTree =
          nextServicesTree.length && !hasServiceChildren
            ? buildServiceTreeFromFlat(nextServicesTree)
            : nextServicesTree;
        setServicesTree(normalizedServicesTree);
        setServices(flattenServicesTree(normalizedServicesTree));
        setServicesLoading(false);
        const nextCategoriesTree: ProductCategory[] = categoriesTreeRes || [];
        const flatCategories: ProductCategory[] = categoriesFlatRes || [];
        const hasCategoryChildren = nextCategoriesTree.some((category) => category.children?.length);
        const normalizedCategoriesTree = nextCategoriesTree.length
          ? hasCategoryChildren
            ? nextCategoriesTree
            : buildCategoryTreeFromFlat(nextCategoriesTree)
          : buildCategoryTreeFromFlat(flatCategories);
        setProductCategoriesTree(normalizedCategoriesTree);
        setProductCategories(
          normalizedCategoriesTree.length
            ? flattenCategoryTree(normalizedCategoriesTree)
            : flatCategories
        );
        setProductCategoriesLoading(false);
        setProducts(productsRes.items || []);
        setProductTotal(productsRes.total || 0);
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

  useEffect(() => {
    let mounted = true;
    const query = search.trim();
    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetchProductsPage({ page: 1, pageSize: 8, query })
        .then((data) => {
          if (!mounted) return;
          setSearchResults(data.items || []);
        })
        .finally(() => {
          if (mounted) setSearchLoading(false);
        });
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [search]);

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
    return [...productCategories].sort((a, b) => {
      const sortA = a.sortOrder ?? 0;
      const sortB = b.sortOrder ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return a.name.localeCompare(b.name);
    });
  }, [productCategories]);


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

  const handleContactReset = () => {
    if (!contactForm) return;
    const next: Record<string, any> = {};
    contactForm.fields.forEach((field) => {
      next[field.name] = getDefaultFieldValue(field);
    });
    setContactFormData(next);
    setContactFormError(null);
    setContactFormSuccess(null);
  };

  const findContactField = (names: string[]) => {
    const lookup = names.map((name) => name.toLowerCase());
    return contactForm?.fields.find((field) =>
      lookup.some((key) => field.name.toLowerCase().includes(key))
    );
  };

  const renderContactField = (field: ContactFormField) => {
    if (field.type === "textarea") {
      return (
        <>
          <label className="sr-only" htmlFor={field.name}>
            {field.label}
          </label>
          <textarea
            id={field.name}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder || field.label}
            value={contactFormData[field.name] || ""}
            onChange={(e) => handleContactFieldChange(field, e.target.value)}
          />
        </>
      );
    }
    if (field.type === "select") {
      return (
        <>
          <label className="sr-only" htmlFor={field.name}>
            {field.label}
          </label>
          <select
            id={field.name}
            name={field.name}
            required={field.required}
            value={contactFormData[field.name] || ""}
            onChange={(e) => handleContactFieldChange(field, e.target.value)}
          >
            <option value="" disabled>
              {field.placeholder || "-- Please choose an option --"}
            </option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </>
      );
    }
    if (field.type === "radio") {
      return (
        <fieldset className="form-field-options">
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
        <fieldset className="form-field-options">
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
      <>
        <label className="sr-only" htmlFor={field.name}>
          {field.label}
        </label>
        <input
          id={field.name}
          name={field.name}
          type={field.type || "text"}
          required={field.required}
          placeholder={field.placeholder || field.label}
          value={contactFormData[field.name] || ""}
          onChange={(e) => handleContactFieldChange(field, e.target.value)}
        />
      </>
    );
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
    setProductsMenuOpen(false);
    setServicesMenuOpen(false);
  };

  const renderProductMenuItems = (nodes: ProductCategory[]) => {
    return nodes.map((category) => {
      const slug = getCategorySlug(category);
      const children = category.children || [];
      if (children.length > 0) {
        return (
          <li key={category.id} className="dropdown">
            <Link to={`/products/${slug}`} onClick={handleMobileLinkClick}>
              {category.name} <span className="caret" aria-hidden="true" />
            </Link>
            <ul className="dropdown-menu">{renderProductMenuItems(children)}</ul>
          </li>
        );
      }
      return (
        <li key={category.id}>
          <Link to={`/products/${slug}`} onClick={handleMobileLinkClick}>
            {category.name}
          </Link>
        </li>
      );
    });
  };

  const renderServiceMenuItems = (nodes: Service[]) => {
    return nodes.map((service) => {
      const children = service.children || [];
      if (children.length > 0) {
        return (
          <li key={service.id} className="dropdown">
            <a href="/#services" onClick={handleMobileLinkClick}>
              {service.name} <span className="caret" aria-hidden="true" />
            </a>
            <ul className="dropdown-menu">{renderServiceMenuItems(children)}</ul>
          </li>
        );
      }
      return (
        <li key={service.id}>
          <a href="/#services" onClick={handleMobileLinkClick}>
            {service.name}
          </a>
        </li>
      );
    });
  };

  const renderProductMobileDetails = (nodes: ProductCategory[]) => {
    return nodes.map((category) => {
      const slug = getCategorySlug(category);
      const children = category.children || [];
      if (children.length > 0) {
        return (
          <details key={category.id}>
            <summary>
              {category.name} <span className="caret" aria-hidden="true" />
            </summary>
            <div className="mchildren">{renderProductMobileDetails(children)}</div>
          </details>
        );
      }
      return (
        <Link key={category.id} to={`/products/${slug}`} onClick={handleMobileLinkClick}>
          {category.name}
        </Link>
      );
    });
  };

  const renderServiceMobileDetails = (nodes: Service[]) => {
    return nodes.map((service) => {
      const children = service.children || [];
      if (children.length > 0) {
        return (
          <details key={service.id}>
            <summary>
              {service.name} <span className="caret" aria-hidden="true" />
            </summary>
            <div className="mchildren">{renderServiceMobileDetails(children)}</div>
          </details>
        );
      }
      return (
        <a key={service.id} href="/#services" onClick={handleMobileLinkClick}>
          {service.name}
        </a>
      );
    });
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
              <ul className={productsMenuOpen ? "dropdown-menu open" : "dropdown-menu"}>
                {productCategoriesLoading ? (
                  <li className="muted">Loading...</li>
                ) : (
                  (() => {
                    const items =
                      productCategoriesTree.length > 0
                        ? renderProductMenuItems(productCategoriesTree)
                        : renderProductMenuItems(productCategories);
                    return items.length === 0 ? <li className="muted">No categories yet.</li> : items;
                  })()
                )}
              </ul>
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
                {servicesLoading ? (
                  <li className="muted">Loading...</li>
                ) : (
                  (() => {
                    const items =
                      servicesTree.length > 0
                        ? renderServiceMenuItems(servicesTree)
                        : renderServiceMenuItems(services);
                    return items.length === 0 ? <li className="muted">No services yet.</li> : items;
                  })()
                )}
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
                      {productCategoriesTree.length > 0
                        ? renderProductMobileDetails(productCategoriesTree)
                        : renderProductMobileDetails(productCategories)}
                    </div>
                  </details>
                  <details>
                    <summary>
                      Services <span className="caret" aria-hidden="true" />
                    </summary>
                    <div className="mchildren">
                      {servicesTree.length > 0
                        ? renderServiceMobileDetails(servicesTree)
                        : renderServiceMobileDetails(services)}
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
              {searchLoading ? (
                <div className="search-empty">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="search-empty">No matches</div>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={`Product-${item.id}`}
                    className="search-item"
                    to={getProductPath(item)}
                    onClick={handleSearchClose}
                  >
                    <span className="search-type">Product</span>
                    <span className="search-title">{item.name}</span>
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
                  <strong>{productTotal || products.length || 120}+</strong>
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
            <section className="contact-wrap">
              {contactFormLoading ? (
                <div className="muted">Loading contact form...</div>
              ) : !contactForm ? (
                <div className="muted">Contact form not configured.</div>
              ) : (
                <form className="my-form" onSubmit={handleContactSubmit} onReset={handleContactReset}>
                  <div className="form-container">
                    <h1>{contactForm.name || "Get in touch!"}</h1>
                    <p className="form-subtitle">
                      {contactForm.description || "Tell us what you need and we’ll reply soon."}
                    </p>
                    {contactFormNote && <p className="form-note">{contactFormNote}</p>}
                    <ul>
                      {(() => {
                        const fields = contactForm.fields;
                        const reasonField =
                          findContactField(["reason", "topic", "subject"]) ||
                          fields.find((field) => field.type === "select");
                        const firstNameField =
                          findContactField(["first", "firstname", "given"]) ||
                          fields.find((field) => field.name.toLowerCase().includes("name"));
                        const lastNameField = findContactField(["last", "lastname", "surname", "family"]);
                        const emailField = findContactField(["email"]);
                        const phoneField = findContactField(["phone", "tel", "mobile"]);
                        const messageField =
                          findContactField(["message", "notes", "details", "comment"]) ||
                          fields.find((field) => field.type === "textarea");

                        const used = new Set(
                          [
                            reasonField,
                            firstNameField,
                            lastNameField,
                            emailField,
                            phoneField,
                            messageField,
                          ]
                            .filter(Boolean)
                            .map((field) => field!.name)
                        );

                        const remaining = fields.filter((field) => !used.has(field.name));

                        return (
                          <>
                            {reasonField && <li key={reasonField.name}>{renderContactField(reasonField)}</li>}
                            {(firstNameField || lastNameField) && (
                              <li className="grid grid-2">
                                <div>{firstNameField ? renderContactField(firstNameField) : null}</div>
                                <div>{lastNameField ? renderContactField(lastNameField) : null}</div>
                              </li>
                            )}
                            {(emailField || phoneField) && (
                              <li className="grid grid-2">
                                <div>{emailField ? renderContactField(emailField) : null}</div>
                                <div>{phoneField ? renderContactField(phoneField) : null}</div>
                              </li>
                            )}
                            {messageField && <li key={messageField.name}>{renderContactField(messageField)}</li>}
                            {remaining.map((field) => (
                              <li key={field.name}>{renderContactField(field)}</li>
                            ))}
                          </>
                        );
                      })()}
                      <li className="btn-row">
                        <button className="btn btn-primary" type="submit" disabled={contactFormSubmitting}>
                          {contactFormSubmitting ? "Sending..." : "Submit"}
                        </button>
                        <button className="btn" type="reset">
                          Reset
                        </button>
                        <span className="required-msg">* Required fields</span>
                      </li>
                    </ul>
                    {contactFormError && <div className="form-error">{contactFormError}</div>}
                    {contactFormSuccess && <div className="form-success">{contactFormSuccess}</div>}
                  </div>
                </form>
              )}
            </section>
          </div>
        </section>
              </>
            }
          />
          <Route path="/products" element={<ProductsIndexPage categories={categories} />} />
          <Route path="/products/:categorySlug" element={<ProductsCategoryPage categories={categories} />} />
          <Route path="/products/:categorySlug/:productSlug" element={<ProductDetail />} />
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
