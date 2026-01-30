export type Page = {
  id: string;
  slug: string;
  title?: string;
  content?: string;
  full_path?: string;
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
  description?: string;
  durationMinutes?: number;
  basePriceCents?: string | null;
  currency?: string | null;
  addons?: ServiceAddon[];
};

export type ProductImage = {
  image?: {
    spacesUrl?: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
  };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  descriptionHtml?: string;
  pricingMode?: string;
  priceCents?: string | null;
  currency?: string | null;
  images?: ProductImage[];
};
