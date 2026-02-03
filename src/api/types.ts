export type Page = {
  id: string;
  slug: string;
  title?: string;
  content?: string;
  full_path?: string;
  parent_id?: string | null;
  parent?: Page | null;
  sort_order?: number;
};

export type MenuItem = {
  id: string;
  label?: string;
  external_url?: string | null;
  page_id?: string | null;
  sort_order?: number;
  page?: Page | null;
};

export type Menu = {
  id: string;
  name: string;
  slug?: string;
  items?: MenuItem[];
};

export type ServiceAddon = {
  id: string;
  name: string;
  priceDeltaCents: string;
  durationDeltaMinutes: number;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Service | null;
  children?: Service[];
  description?: string;
  durationMinutes?: number;
  basePriceCents?: string | null;
  currency?: string | null;
  addons?: ServiceAddon[];
};

export type ProductImage = {
  sortOrder?: number;
  title?: string | null;
  altText?: string | null;
  image?: {
    spacesUrl?: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
  };
};

export type ContactFormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
};

export type ContactForm = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  fields: ContactFormField[];
  thankYouMessage?: string | null;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug?: string;
  sortOrder?: number;
  parentId?: string | null;
  parent?: ProductCategory | null;
  children?: ProductCategory[];
};

export type ProductCategoryLink = {
  id: string;
  category?: ProductCategory;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category?: ProductCategory | null;
  categoryLinks?: ProductCategoryLink[];
  shortDescription?: string;
  descriptionHtml?: string;
  pricingMode?: string;
  priceCents?: string | null;
  currency?: string | null;
  images?: ProductImage[];
};
