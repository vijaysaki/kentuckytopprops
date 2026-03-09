export const API_BASE_URL = "https://api.adeptlogics.com";
export const PRODUCTS_ENDPOINT = "/public/products/categories";
export const PRODUCTS_LIST_ENDPOINT = "/public/products";
export const SERVICES_ENDPOINT = "/public/services/tree";
export const PAGES_ENDPOINT = "/public/pages";
export const BLOGS_ENDPOINT = "/public/blogs";
export const CONTACT_FORMS_ENDPOINT = "/public/contact-forms";
export const TENANT_DOMAIN = "kentuckytopprops.com";
export const TENANT_ID = "48b0c409-b37b-4719-9ebd-8678f774db64";
export const PRODUCTS_PAGE_SIZE = 24;

export const fallbackProducts = [
  {
    name: "Top Props",
    url: "/products/top-props",
    children: [
      { name: "Event Props", url: "/products/top-props/events" },
      { name: "Photo Props", url: "/products/top-props/photo" }
    ]
  },
  {
    name: "Accessories",
    url: "/products/accessories"
  }
];

export const fallbackServices = [
  {
    name: "Setup",
    url: "/services/setup",
    children: [
      { name: "On-site Setup", url: "/services/setup/onsite" },
      { name: "Virtual Setup", url: "/services/setup/virtual" }
    ]
  },
  {
    name: "Consulting",
    url: "/services/consulting"
  }
];
