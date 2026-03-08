<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
import { fetchProductsPage } from "./api/public";
=======
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
  currency?: string | null;
};

type ProductCategory = {
  id: string;
  name: string;
  slug?: string;
};

function ProductsCategoryPage(_: { categories: ProductCategory[] }) {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [pageSize, setPageSize] = useState(20);
  const pageParam = Number(searchParams.get("page") || "1");
  const requestedPage = Number.isFinite(pageParam) ? pageParam : 1;
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  useEffect(() => {
=======
<<<<<<< HEAD
      categorySlug,
    }).then((data) => {
      setItems(data.items || []);
        categorySlug,
      }).then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
    }, [categorySlug, requestedPage, pageSize]);

    return (
      <section className="section">
        <h2>Products in Category</h2>
        <div>
          Page size:
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        {loading ? <div>Loading...</div> : (
          <ul>
            {items.map(product => (
              <li key={product.id}>
                <Link to={`/products/${product.slug}`}>{product.name}</Link>
                {product.shortDescription && <div>{product.shortDescription}</div>}
              </li>
            ))}
          </ul>
        )}
        <div>Total: {total}</div>
      </section>
    );
  }

  function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-logo">
            <img src="https://flowbite.com/docs/images/logo.svg" alt="Logo" style={{ height: 28 }} />
            Kentucky Top Props
          </a>
          <ul className="navbar-menu">
            <li>
              <a className="navbar-link" href="/">Home</a>
            </li>
            <li>
              <a className="navbar-link" href="/products/cat-one">Category One</a>
            </li>
            <li>
              <a className="navbar-link" href="/products/cat-two">Category Two</a>
            </li>
            <li className={dropdownOpen ? "dropdown open" : "dropdown"}>
              <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                More ▼
              </button>
              <ul className="dropdown-menu">
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  export default function App() {
    // Example categories for demonstration
    const categories: ProductCategory[] = [
      { id: "1", name: "Category One", slug: "cat-one" },
      { id: "2", name: "Category Two", slug: "cat-two" },
    ];

    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<div>Welcome to Kentucky Top Props!</div>} />
          <Route path="/products/:categorySlug" element={<ProductsCategoryPage categories={categories} />} />
          {/* Add more routes/components as needed */}
        </Routes>
      </>
    );
  }
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
>>>>>>> parent of 46b5ff4 (new)
      </div>
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(product => (
            <li key={product.id}>
              <Link to={`/products/${product.slug}`}>{product.name}</Link>
              {product.shortDescription && <div>{product.shortDescription}</div>}
            </li>
          ))}
        </ul>
      )}
      <div>Total: {total}</div>
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

function ServicesIndex({ services }: { services: Service[] }) {
  const topLevel = services.filter((service) => !service.parentId);
  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Services</span>
        </nav>
        <div className="section-header">
          <h2>Services</h2>
        </div>
        {topLevel.length === 0 ? (
          <div className="muted">No services found yet.</div>
        ) : (
          <div className="grid">
            {topLevel.map((service) => (
              <Link
                key={service.id}
                className="card"
                to={`/services/${service.slug || service.id}`}
              >
                <h3>{service.name}</h3>
                <p>{service.description || "Service details available."}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceDetail({ services, loading }: { services: Service[]; loading: boolean }) {
  const { serviceSlug } = useParams();
  const service = services.find((item) => item.slug === serviceSlug || item.id === serviceSlug);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Loading service...</div>
        </div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Service not found.</div>
          <Link className="btn" to="/services">
            Back to services
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/services">Services</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{service.name}</span>
        </nav>
        <h1>{service.name}</h1>
        {service.description && <p className="muted">{service.description}</p>}
        {(service.durationMinutes || service.basePriceCents) && (
          <div className="meta">
            {service.durationMinutes ? `${service.durationMinutes} min` : "Custom duration"}
            {service.basePriceCents ? ` • $${dollarsFromCents(service.basePriceCents)}` : ""}
          </div>
        )}
      </div>
    </section>
  );
}

function PageDetail({ pages }: { pages: Page[] }) {
  const { slug } = useParams();
  const page = pages.find((item) => item.slug === slug);
  if (!page) {
    return (
      <section className="section">
        <div className="container">
          <div className="muted">Page not found.</div>
          <Link className="btn" to="/">
            Back to home
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{page.title || page.slug}</span>
        </nav>
        <h1>{page.title || page.slug}</h1>
        <div className="rich" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
      </div>
    </section>
  );
}

function AdminRedirect() {
  useEffect(() => {
    window.location.replace("https://admin.adeptlogics.com");
  }, []);
  return (
    <section className="section">
      <div className="container">
        <div className="muted">Redirecting to admin...</div>
      </div>
    </section>
>>>>>>> parent of 46b5ff4 (new)
  );
}

export default function App() {
<<<<<<< HEAD
  // Example categories for demonstration
  const categories: ProductCategory[] = [
    { id: "1", name: "Category One", slug: "cat-one" },
    { id: "2", name: "Category Two", slug: "cat-two" },
  ];

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Welcome to Kentucky Top Props!</div>} />
        <Route path="/products/:categorySlug" element={<ProductsCategoryPage categories={categories} />} />
        {/* Add more routes/components as needed */}
      </Routes>
    </>
=======
  const navigate = useNavigate();
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
        if (mounted) {
          // no-op
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirect");
    if (!redirectParam) return;
    const target = decodeURIComponent(redirectParam);
    params.delete("redirect");
    const nextSearch = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`
    );
    navigate(target, { replace: true });
  }, [navigate]);

  const contactFormSlug =
    contactPage?.contact_form_slug || contactPage?.contactFormSlug || contactPage?.slug || "contact";

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


  const categories = useMemo(() => {
    return [...productCategories].sort((a, b) => {
      const sortA = a.sortOrder ?? 0;
      const sortB = b.sortOrder ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return a.name.localeCompare(b.name);
    });
  }, [productCategories]);




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
      const slug = service.slug || service.id;
      if (children.length > 0) {
        return (
          <li key={service.id} className="dropdown">
            <Link to={`/services/${slug}`} onClick={handleMobileLinkClick}>
              {service.name} <span className="caret" aria-hidden="true" />
            </Link>
            <ul className="dropdown-menu">{renderServiceMenuItems(children)}</ul>
          </li>
        );
      }
      return (
        <li key={service.id}>
          <Link to={`/services/${slug}`} onClick={handleMobileLinkClick}>
            {service.name}
          </Link>
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
      const slug = service.slug || service.id;
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
        <Link key={service.id} to={`/services/${slug}`} onClick={handleMobileLinkClick}>
          {service.name}
        </Link>
      );
    });
  };

  const renderContactForm = (form: ContactForm) => {
    const fields = form.fields;
    const reasonField =
      findContactField(["reason", "topic", "subject"]) || fields.find((field) => field.type === "select");
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
      [reasonField, firstNameField, lastNameField, emailField, phoneField, messageField]
        .filter(Boolean)
        .map((field) => field!.name)
    );

    const remaining = fields.filter((field) => !used.has(field.name));

    return (
      <form className="my-form" onSubmit={handleContactSubmit} onReset={handleContactReset}>
        <div className="form-container">
          <h1>{form.name || "Get in touch!"}</h1>
          <p className="form-subtitle">
            {form.description || "Tell us what you need and we’ll reply soon."}
          </p>
          {contactFormNote && <p className="form-note">{contactFormNote}</p>}
          <ul>
            {reasonField ? <li key={reasonField.name}>{renderContactField(reasonField)}</li> : null}
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
            {remaining.map((field) => (
              <li key={field.name}>{renderContactField(field)}</li>
            ))}
            {messageField ? <li key={messageField.name}>{renderContactField(messageField)}</li> : null}
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
    );
  };

  const contactSection = (
    <section className="section alt">
      <div className="container">
        <h2>Contact</h2>
        <div
          className="rich"
          dangerouslySetInnerHTML={{
            __html: contactPage?.content || "Contact us to book your next production.",
          }}
        />
        <section className="contact-wrap">
          {contactFormLoading ? (
            <div className="muted">Loading contact form...</div>
          ) : !contactForm ? (
            <div className="muted">Contact form not configured.</div>
          ) : (
            renderContactForm(contactForm)
          )}
        </section>
      </div>
    </section>
  );

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
              <Link to="/pages/about" onClick={handleMobileLinkClick}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={handleMobileLinkClick}>
                Contact
              </Link>
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
                  <Link to="/pages/about" onClick={handleMobileLinkClick}>
                    About
                  </Link>
                  <Link to="/contact" onClick={handleMobileLinkClick}>
                    Contact
                  </Link>
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
                <Link className="btn primary" to="/products">
                  Explore Catalog
                </Link>
                <Link className="btn" to="/services">
                  View Services
                </Link>
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


              </>
            }
          />
          <Route path="/products" element={<ProductsIndexPage categories={categories} />} />
          <Route path="/products/:categorySlug" element={<ProductsCategoryPage categories={categories} />} />
          <Route path="/products/:categorySlug/:productSlug" element={<ProductDetail categories={categories} />} />
          <Route path="/services" element={<ServicesIndex services={services} />} />
          <Route path="/services/:serviceSlug" element={<ServiceDetail services={services} loading={servicesLoading} />} />
          <Route path="/contact" element={contactSection} />
          <Route path="/pages/:slug" element={<PageDetail pages={pages} />} />
          <Route path="/admin" element={<AdminRedirect />} />
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
                  const href = item.external_url || (item.page?.slug ? `/pages/${item.page.slug}` : "#");
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
                  const href = item.external_url || (item.page?.slug ? `/pages/${item.page.slug}` : "#");
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
                    <a href={`/services/${service.slug || service.id}`}>{service.name}</a>
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
>>>>>>> parent of 46b5ff4 (new)
  );
}
