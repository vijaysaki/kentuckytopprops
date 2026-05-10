# Adeptlogics Public API – Developer Guide

This guide is for developers building websites that consume content from the Adeptlogics admin platform. Use it when integrating products, services, pages, galleries, contact forms, and other content into your frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Tenant Resolution](#base-url--tenant-resolution)
3. [CORS Requirements](#cors-requirements)
4. [Endpoints Reference](#endpoints-reference)
5. [Products API](#products-api)
6. [Services API](#services-api)
7. [Chatbot API](#chatbot-api)
8. [Pages & Menus API](#pages--menus-api)
9. [Galleries API](#galleries-api)
10. [Contact Forms API](#contact-forms-api)
11. [Hero Sections API](#hero-sections-api)
12. [Site Info API](#site-info-api)
13. [Surveys & Questionnaires API](#surveys--questionnaires-api)
14. [Photo Delivery (Fulfillment)](#photo-delivery-fulfillment)
15. [Error Handling](#error-handling)
16. [Best Practices](#best-practices)
17. [Documentation Maintenance](#documentation-maintenance)

---

## Overview

- **Base path:** All public endpoints are under `/public/` on the Nest app. **Production URLs** also use the app’s global prefix **`/api`**, so full paths look like **`/api/public/...`** (e.g. `https://api.adeptlogics.com/api/public/pages`).
- **Authentication:** Public endpoints do **not** require authentication
- **Tenant resolution:** Most endpoints need either `tenantId`, `domain`, or a valid `Origin` header
- **Response format:** JSON

---

## Base URL & Tenant Resolution

### Base URL

- **Production:** `https://api.adeptlogics.com` (or your deployed API URL). **Public API base path:** `https://api.adeptlogics.com/api/public` (the server sets a global `/api` prefix before route paths like `/public/pages`).
- **Local dev:** `http://localhost:3000/api/public` (or your backend port + `/api/public`)

### Tenant identification

Most endpoints resolve the tenant (website) in this order:

1. **`tenantId`** query param – UUID of the tenant
2. **`domain`** query param – e.g. `example.com`
3. **`Origin`** header – hostname from the request origin (e.g. `https://example.com`)

**Rule:** Provide at least one of: `tenantId`, `domain`, or a request from an allowed origin.

**Example:**
```
GET /api/public/products?domain=example.com
GET /api/public/products?tenantId=uuid-here
```
(If you call the API without the global prefix, use the full URL including `/api/public`.)

---

## CORS Requirements

Your website’s origin must be allowed for CORS. Configure this in the Adeptlogics admin:

- **Super Admin → Settings → Global allowed origins:** e.g. `https://yoursite.com`, `http://localhost:5173`
- **Admin → Domains:** Per-tenant allowed origins

For local development, add your dev URL (e.g. `http://127.0.0.1:8080`).

---

## Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/public/site` | GET | Site contact info |
| `/public/products` | GET | List products (paginated, filterable) |
| `/public/products/categories` | GET | List product categories |
| `/public/products/by-slug/:slug` | GET | Single product by slug |
| `/public/products/:productId` | GET | Single product by ID |
| `/public/services` | GET | List services |
| `/public/chatbot/ask` | POST | Ask tenant chatbot (detachable instance support) |
| `/tenants/:tenantId/chatbot/instances` | GET | Admin: list chatbot instances for tenant |
| `/tenants/:tenantId/chatbot/instances/:tenantModuleId/config` | PATCH | Admin: update AI config/prompt |
| `/tenants/:tenantId/chatbot/instances/:tenantModuleId/files` | GET | Admin: list uploaded knowledge files |
| `/tenants/:tenantId/chatbot/instances/:tenantModuleId/files` | POST | Admin: upload knowledge file (`txt/pdf/docx/xls/xlsx`) |
| `/tenants/:tenantId/chatbot/instances/:tenantModuleId/files/:fileId` | DELETE | Admin: delete knowledge file |
| `/tenants/:tenantId/chatbot/instances/:tenantModuleId/ask` | POST | Admin: test ask for chatbot instance |
| `/public/pages` | GET | List pages |
| `/public/pages/menus` | GET | List menus |
| `/pages/block-categories` | GET/POST | Admin: list/create block categories |
| `/pages/block-categories/:categoryId` | PATCH/DELETE | Admin: update/delete block category |
| `/pages/library/blocks` | GET/POST | Admin: list/create reusable blocks |
| `/pages/library/blocks/:blockId` | GET/PATCH/DELETE | Admin: read/update/delete reusable block |
| `/pages/library/blocks/:blockId/schedules` | GET/POST | Admin: list/create block schedules |
| `/pages/library/blocks/schedules/:scheduleId` | PATCH/DELETE | Admin: update/delete block schedule |
| `/pages/:pageId/blocks/insert-library` | POST | Admin: insert reusable block into page (`linked` or `detached`) |
| `/pages/header-variants` | GET/POST | Admin: list/create header variants |
| `/pages/header-variants/:headerId` | PATCH/DELETE | Admin: update/delete header variant |
| `/pages/footer-variants` | GET/POST | Admin: list/create footer variants |
| `/pages/footer-variants/:footerId` | PATCH/DELETE | Admin: update/delete footer variant |
| `/tenants/:tenantId/modules` | POST | Admin: update tenant module config (used for CMS `cssSettings`) |
| `/public/galleries/tree` | GET | Gallery tree |
| `/public/galleries/:id/images` | GET | Images in a gallery |
| `/public/contact-forms` | GET | List contact forms |
| `/public/contact-forms/by-slug/:slug` | GET | Single form by slug |
| `/public/contact-forms/:formId/submissions` | POST | Submit form |
| `/public/heroes` | GET | Hero section for a page |
| `/public/surveys` | GET | List active questionnaires |
| `/public/surveys/by-slug/:slug` | GET | Single questionnaire by slug |
| `/public/surveys/:questionnaireId/responses` | POST | Submit survey response |
| `/public/blogs` | GET | List published blog posts (paginated) |
| `/public/blogs/categories` | GET | List blog categories |
| `/public/blogs/by-slug/:slug` | GET | Single post by slug |
| `/public/blogs/:postId` | GET | Single post by ID |
| `/public/fulfill/:token` | GET | Photo delivery link (sends email) |
| `/public/purchase-requests` | POST | Create photo purchase request |

---

## Products API

### List products

```
GET /public/products
```

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `tenantId` | string | - | Tenant UUID |
| `domain` | string | - | Tenant domain |
| `limit` | number | 20 | Items per page (1–100) |
| `offset` | number | 0 | Pagination offset |
| `categoryId` | string | - | Filter by category ID |
| `categorySlug` | string | - | Filter by category slug |
| `q` | string | - | Search in name, description |
| `featured` | boolean | - | Only featured products |
| `inStock` | boolean | - | In stock or backorder allowed |
| `rentalEnabled` | boolean | - | Only rental products |
| `allowBackorder` | boolean | - | Only products allowing backorder |
| `minPriceCents` | number | - | Min price (cents) |
| `maxPriceCents` | number | - | Max price (cents) |
| `pricingMode` | string | - | `fixed_price`, `starting_at`, etc. |
| `currency` | string | - | e.g. `USD` |
| `rentalUnit` | string | - | `hour`, `day`, `week` |
| `sort` | string | - | See sort options below |

**Sort options:** `price_asc`, `price_desc`, `newest`, `oldest`, `name_asc`, `name_desc`, `featured_first`

**Response:**
```json
{
  "items": [
    {
      "id": "product-uuid",
      "name": "Sample Product",
      "imageCount": 3,
      "previewImageId": "image-uuid",
      "previewImageUrl": "https://<bucket>.<region>.digitaloceanspaces.com/images/...-medium.jpg",
      "previewThumbnailUrl": "https://<bucket>.<region>.digitaloceanspaces.com/images/...-thumb.jpg",
      "previewAltText": "Sample Product"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

`imageCount` is the total number of linked product images. `previewImageUrl` and `previewThumbnailUrl` return the first product image (by image sort order) when available.

### List categories

```
GET /public/products/categories
```

### Single product by slug

```
GET /public/products/by-slug/:slug
```

### Single product by ID

```
GET /public/products/:productId
```

---

## Blogs API

### List posts

```
GET /public/blogs
```

**Query params:** `tenantId`, `domain`, `limit`, `offset`, `categoryId`, `categorySlug`, `featured`, `sort` (`newest` \| `oldest` \| `title_asc` \| `title_desc`)

**Response:** `{ items, total, limit, offset }` — only published posts with `published_at` set.

### List categories

```
GET /public/blogs/categories
```

**Query params:** `tenantId`, `domain`

### Single post by slug

```
GET /public/blogs/by-slug/:slug
```

### Single post by ID

```
GET /public/blogs/:postId
```

---

## Services API

### List services

```
GET /public/services
```

**Query params:** `tenantId`, `domain`

**Response:** Array of services (with `parent` and `children` for hierarchy).

**Note:** No pagination or filters yet. For large catalogs, consider client-side filtering.

---

## Chatbot API

The Chatbot module is detachable and instance-based per tenant (via Tenant Modules).  
Create one or more `chatbot` module instances under Tenant → Modules, then configure/upload files here.

### Public ask endpoint

```
POST /public/chatbot/ask
```

With the global API prefix enabled, production integrations should call:

``` 
POST /api/public/chatbot/ask
```

**Body:**

```json
{
  "tenantId": "optional-tenant-uuid",
  "domain": "optional-domain.com",
  "instanceName": "optional-instance-name",
  "question": "What are your support hours?"
}
```

**Tenant resolution:** `tenantId` first, then `domain`, then request `Origin`.

### Implementation example (website widget / landing page)

Use this pattern from any website page (detached widget, static HTML site, or SPA):

```js
async function askAdeptlogicsChat(question) {
  const resp = await fetch('https://api.adeptlogics.com/api/public/chatbot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: 'YOUR_TENANT_UUID',
      // or use `domain` if preferred:
      // domain: 'yourdomain.com',
      // optional: leave out to let backend pick first enabled instance
      // instanceName: 'default',
      question,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || data.error || 'Chat request failed');
  return data; // { answer, confidence, usedChunks, instanceName, model }
}
```

Notes:

- If `instanceName` is provided but that instance is disabled/missing, the API returns `404`.
- If `instanceName` is omitted, backend selects the first enabled chatbot instance for the tenant.
- For multi-tenant public sites, pass `domain` per request rather than hardcoding a `tenantId`.
- For same-origin calls from an allowed domain, tenant can also resolve from the `Origin` header.

### Admin endpoints (authenticated)

```
GET    /tenants/:tenantId/chatbot/instances
PATCH  /tenants/:tenantId/chatbot/instances/:tenantModuleId/config
GET    /tenants/:tenantId/chatbot/instances/:tenantModuleId/files
POST   /tenants/:tenantId/chatbot/instances/:tenantModuleId/files
DELETE /tenants/:tenantId/chatbot/instances/:tenantModuleId/files/:fileId
POST   /tenants/:tenantId/chatbot/instances/:tenantModuleId/ask
```

### Upload notes

- Supported files: `.txt`, `.pdf`, `.docx`, `.xls`, `.xlsx`
- `.doc` is not parsed directly; convert to `.docx`
- Uploaded files are text-extracted and chunked for retrieval

### AI provider config

Per chatbot instance config accepts:

- `systemPrompt`
- `aiProvider` (currently `openai`)
- `aiModel` (e.g. `gpt-4o-mini`)
- `aiApiKey`
- `aiBaseUrl` (optional custom-compatible endpoint)
- `temperature`

---

## Pages & Menus API

### List pages

```
GET /public/pages
```

**Query params:** `tenantId`, `domain`

**Response:** Array of pages with `full_path`, `slug`, `status`, etc.

Public page responses now include block-aware fields:

- `renderedBlocks`: schedule-filtered block instances for the page
- `renderedHtml`: concatenated HTML output from visible blocks

Linked/detached behavior:

- `linked` page blocks render the latest library HTML from reusable blocks
- `detached` page blocks render the snapshot HTML stored on the page block

Schedule behavior:

- Block visibility is evaluated at request time
- Time windows are interpreted using tenant timezone (`tenant_module.tenants.timezone`)
- Missing timezone falls back to `UTC`

Header/footer behavior:

- Page can set `header_variant_id` and `footer_variant_id`
- If page-level values are missing, tenant default header/footer are used
- Public page response includes:
  - `resolved_header` (`html_content`, `include_menu`, `include_search`, `menu_slug`)
  - `resolved_footer` (`html_content`)
- Header variants are HTML-based and can explicitly enable menu/search rendering

### CMS CSS settings (Admin)

CMS visual tokens can be saved as structured fields in the CMS module config (no raw CSS required):

```
POST /tenants/:tenantId/modules
Content-Type: application/json

{
  "tenantModuleId": "cms-tenant-module-uuid",
  "moduleId": "cms-module-uuid",
  "enabled": true,
  "config": {
    "cssSettings": {
      "colorScheme": "light",
      "primaryColor": "#2563EB",
      "secondaryColor": "#14B8A6",
      "backgroundColor": "#FFFFFF",
      "textColor": "#111827",
      "headingFont": "Inter",
      "bodyFont": "Inter"
    }
  }
}
```

Notes:

- `config.cssSettings` is tenant-scoped and stored on the CMS tenant-module record.
- Each style token is its own field so CMS users can manage color/font choices safely.
- Color fields should be `#RRGGBB` format.

### List menus

```
GET /public/pages/menus
```

**Query params:** `tenantId`, `domain`

**Response:** Array of menus with menu items.

### Reusable Blocks (Admin)

Reusable block APIs are tenant-scoped and require authenticated admin access.

#### Create reusable block

```
POST /pages/library/blocks?tenantId=<tenant-uuid>
Content-Type: application/json

{
  "name": "Homepage Promo Banner",
  "slug": "homepage-promo-banner",
  "category_id": "optional-category-uuid",
  "status": "active",
  "html_content": "<section><h2>Promo</h2><p>...</p></section>"
}
```

#### Insert block into page (linked or detached)

```
POST /pages/:pageId/blocks/insert-library
Content-Type: application/json

{
  "library_block_id": "block-uuid",
  "insertion_mode": "linked",
  "sort_order": 20
}
```

- `linked`: page renders current library block HTML
- `detached`: page stores a snapshot copy at insert time

#### Create block schedule

```
POST /pages/library/blocks/:blockId/schedules
Content-Type: application/json

{
  "is_always_on": false,
  "days_of_week": [1,2,3,4,5],
  "start_time_local": "09:00",
  "end_time_local": "17:00",
  "active_from_date": "2026-03-10",
  "active_until_date": "2026-06-30"
}
```

Validation:

- `start_time_local < end_time_local`
- `days_of_week` values must be `0..6`
- `active_from_date <= active_until_date`

### Header & Footer Variants (Admin)

Headers/footers are tenant-scoped reusable HTML templates for pages.

#### Create header variant

```
POST /pages/header-variants?tenantId=<tenant-uuid>
Content-Type: application/json

{
  "name": "Default Header",
  "slug": "default-header",
  "html_content": "<header>...</header>",
  "include_menu": true,
  "include_search": true,
  "menu_slug": "header",
  "is_default": true
}
```

#### Create footer variant

```
POST /pages/footer-variants?tenantId=<tenant-uuid>
Content-Type: application/json

{
  "name": "Default Footer",
  "slug": "default-footer",
  "html_content": "<footer>...</footer>",
  "is_default": true
}
```

Notes:

- Only one default header and one default footer exist per tenant
- Setting `is_default=true` on a variant automatically clears previous default

---

## Galleries API

### Gallery tree

```
GET /public/galleries/tree
```

**Query params:** `tenantId`, `domain`

**Response:** Tree of galleries (id, name, slug, children). Only active galleries.

### Gallery images

```
GET /public/galleries/:id/images
```

**Query params:** `tenantId`, `domain`

**Response:** Array of images with `id`, `title`, `url`, `thumbnailUrl`, etc.

---

## Contact Forms API

### List forms

```
GET /public/contact-forms
```

### Form by slug

```
GET /public/contact-forms/by-slug/:slug
```

### Submit form

```
POST /public/contact-forms/:formId/submissions
Content-Type: application/json

{
  "data": {
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  },
  "captchaToken": "optional-hcaptcha-token"
}
```

---

## Hero Sections API

### Get hero for a page

```
GET /public/heroes?tenantId=:tenantId&fullPath=:fullPath
```

**Query params:**
- `tenantId` (required)
- `fullPath` (required) – e.g. `/`, `/about`, `/products`

**Response:** Hero object with slides, or `null` if none.

---

## Site Info API

### Get site contact info

```
GET /public/site
```

**Query params:** `tenantId`, `domain`

**Response:**
```json
{
  "contact_email": "hello@example.com",
  "contact_phone": "+1234567890",
  "instagram": null
}
```

---

## Surveys & Questionnaires API

### List questionnaires

```
GET /public/surveys
```

**Query params:** `tenantId`, `domain`

**Response:** Array of active questionnaires with questions (including conditional logic).

### Get questionnaire by slug

```
GET /public/surveys/by-slug/:slug
```

**Query params:** `tenantId`, `domain`

**Response:** Single questionnaire with full question tree.

### Submit response

```
POST /public/surveys/:questionnaireId/responses
Content-Type: application/json

{
  "answers": [
    { "questionId": "uuid", "answer": "text value" },
    { "questionId": "uuid", "answer": ["option1", "option2"] },
    { "questionId": "uuid", "answer": 5 }
  ]
}
```

**Answer types:** `string`, `string[]` (multi-select), `number` (scale/rating).

### Survey scheduling

Questionnaires can be scheduled in the admin:

- **Scheduling disabled:** Survey runs whenever status is Active (no date restriction).
- **Scheduling enabled:** Survey is only runnable within the date range:
  - **Active from** – Start date (inclusive). Leave empty for no start limit.
  - **Active until** – End date (inclusive). Leave empty for no end limit.
  - **Single date:** Set both to the same date.
  - **Date range:** Set different start and end dates.

When outside the active window, the questionnaire returns 404 from the public API.

---

## Photo Delivery (Fulfillment)

### Delivery link (sends email)

```
GET /public/fulfill/:token
```

Opens in browser. Sends the buyer an email with download links. Returns HTML.

### Create purchase request

```
POST /public/purchase-requests
Content-Type: application/json

{
  "tenantId": "uuid",
  "buyerEmail": "buyer@example.com",
  "items": [
    { "url": "https://...", "fileName": "photo.jpg", "title": "Photo 1" }
  ],
  "amount": "50.00",
  "payment": { "venmo": "@user", "zelle": "email@example.com" }
}
```

---

## Error Handling

- **400 Bad Request:** Missing `tenantId`/`domain`/origin, or invalid params
- **404 Not Found:** Tenant, resource, or route not found
- **500 Internal Server Error:** Server error (check response body for details)

**Example error response:**
```json
{
  "statusCode": 404,
  "message": "Tenant not found for domain"
}
```

---

## Best Practices

### 1. Always identify the tenant

Use `domain` or `tenantId` when the request origin might not be set (e.g. server-side, mobile):

```
GET /public/products?domain=example.com
```

### 2. Paginate products

Avoid loading all products at once:

```
GET /public/products?limit=20&offset=0
GET /public/products?limit=20&offset=20
```

### 3. Use filters to reduce payload

```
GET /public/products?categorySlug=prints&featured=true&limit=12
```

### 4. Use slugs for URLs

Prefer slugs for SEO and stability:

```
GET /public/products/by-slug/my-product
GET /public/contact-forms/by-slug/contact
```

### 5. Handle CORS

Ensure your domain is in the allowed origins. If you see CORS errors, add your domain in the admin.

### 6. Deployment: "Unable to load products"

When your frontend is deployed (e.g. DigitalOcean, Vercel) and shows "Unable to load products", the products API is failing. Fix it by setting **build-time environment variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Full API URL, e.g. `https://api.adeptlogics.com` |
| `VITE_TENANT_ID` | Preferred | Tenant UUID from Super Admin → Tenants |
| `VITE_TENANT_DOMAIN` | Fallback | Tenant domain (e.g. `kentuckytopprops.com`) when `VITE_TENANT_ID` is not set |

**Why:** The backend resolves the tenant by `tenantId` (query), `domain` (query), or `Origin` header. Deployed URLs (e.g. `xxx.ondigitalocean.app`) usually don’t match the tenant’s domain in the database, so you must pass `tenantId` or `domain` explicitly.

**Check:** In your deployment platform (DigitalOcean App Platform, Vercel, etc.), add these under **App Settings → Environment Variables** and redeploy.

### 7. Cache when appropriate

Products, categories, pages, and menus change infrequently. Cache responses with appropriate TTLs.

### 7. Respect rate limits

Avoid aggressive polling. Use reasonable cache TTLs and incremental updates where possible.

---

## Deployment Troubleshooting: "Unable to load products"

If your deployed frontend shows "Unable to load products" or similar API errors:

### 1. Set build-time environment variables

Configure these in your hosting platform (DigitalOcean, Vercel, Netlify, etc.):

| Variable | Required | Description |
|----------|----------|--------------|
| `VITE_API_BASE_URL` | Yes | Full API URL, e.g. `https://api.adeptlogics.com` |
| `VITE_TENANT_ID` | Preferred | Tenant UUID from Super Admin |
| `VITE_TENANT_DOMAIN` | Fallback | Tenant domain, e.g. `kentuckytopprops.com` (use if `VITE_TENANT_ID` is not set) |

**Rule:** You need either `VITE_TENANT_ID` or `VITE_TENANT_DOMAIN`. When the app is deployed to a URL like `xxx.ondigitalocean.app`, the backend cannot match it to your tenant's domain, so you must pass tenant identity explicitly.

### 2. Verify tenant and Products module

- In **Super Admin**, confirm the tenant exists and the **Products** module is assigned and enabled.
- Ensure the tenant's `domain` in the database matches what you pass (e.g. `kentuckytopprops.com` or `www.kentuckytopprops.com`).

### 3. Check CORS

Your deployment origin (e.g. `https://yourapp.ondigitalocean.app`) must be allowed. Domains ending in `.ondigitalocean.app`, `.vercel.app`, `.netlify.app` are allowed by default. For custom domains, add them in **Admin → Domains** or **Super Admin → Global CORS**.

### 4. Test the API directly

```bash
# With tenant ID
curl "https://api.adeptlogics.com/public/products?tenantId=YOUR_TENANT_UUID&limit=5"

# With domain
curl "https://api.adeptlogics.com/public/products?domain=kentuckytopprops.com&limit=5"
```

If these return products, the backend is fine; the issue is frontend configuration.

---

## Quick Reference: Common Patterns

### Fetch products for a category page
```
GET /public/products?domain=example.com&categorySlug=prints&limit=12&sort=price_asc
```

### Fetch a single product for a detail page
```
GET /public/products/by-slug/my-product?domain=example.com
```

### Build navigation from menus
```
GET /public/pages/menus?domain=example.com
```

### Fetch hero banner for current page
```
GET /public/heroes?tenantId=xxx&fullPath=/about
```

### Submit a contact form
```
POST /public/contact-forms/{formId}/submissions
Content-Type: application/json
Body: { "data": { "name": "...", "email": "...", "message": "..." } }
```

### Submit a survey response
```
POST /public/surveys/{questionnaireId}/responses
Content-Type: application/json
Body: { "answers": [{ "questionId": "uuid", "answer": "..." }] }
```

---

## Deployment Troubleshooting: "Unable to load products"

If your deployed frontend shows **"Unable to load products. Please try again or check your connection"**, the products API request is failing. Common causes:

### 1. Tenant identification (most common)

When the frontend is served from a URL like `https://your-app-xxx.ondigitalocean.app`, the backend cannot match that URL to your tenant's domain in the database. You must provide tenant identification explicitly.

**Fix:** Set these build-time environment variables in your deployment (DigitalOcean, Vercel, etc.):

| Variable | Description |
|---------|-------------|
| `VITE_TENANT_ID` | UUID of your tenant (from Super Admin → Tenants). **Preferred** – most reliable. |
| `VITE_TENANT_DOMAIN` | Your tenant's domain, e.g. `kentuckytopprops.com`. Use if you don't have the tenant ID. |
| `VITE_API_BASE_URL` | Your API URL, e.g. `https://api.adeptlogics.com`. **Required.** |

**Example (DigitalOcean App Platform):**
- `VITE_API_BASE_URL` = `https://api.adeptlogics.com`
- `VITE_TENANT_ID` = `your-tenant-uuid` (from Super Admin)

### 2. CORS

Your deployment origin must be allowed. Domains ending in `.ondigitalocean.app`, `.vercel.app`, `.netlify.app` are allowed by default. For custom domains, add them in **Admin → Domains** or **Super Admin → Global CORS origins**.

### 3. Products module

Ensure the **Products** module is assigned and enabled for your tenant in Super Admin.

### 4. Verify in browser

Open DevTools → Network, click a product category, and inspect the failing request:
- **404 "Tenant not found for domain"** → Set `VITE_TENANT_ID` or `VITE_TENANT_DOMAIN`
- **CORS error** → Add your origin to allowed domains
- **Failed to fetch / network error** → Check `VITE_API_BASE_URL` and that the API is reachable

---

## Documentation Maintenance

**When making any implementation changes, update this guide so it stays accurate for API consumers.**

### Update the API Developer Guide when you:

- Add, remove, or change public API endpoints
- Add or change query parameters, request body fields, or response shapes
- Change tenant resolution, CORS, or error handling behavior
- Introduce new modules or features exposed via the public API

### What to update:

1. **Endpoints Reference** – Add/remove rows in the table
2. **Relevant section** – Document params, request/response formats, examples
3. **Changelog** – Add a dated entry describing the change

### Changelog

- **2026-03-20:** Added concrete chatbot implementation guidance for website/landing-page integrations, including prefixed endpoint usage (`/api/public/chatbot/ask`), request payload examples, and instance-selection behavior.
- **2026-04-06:** Corrected chatbot tenant FK expectation to align with `tenant_module.tenants`; upload failures from orphan/mismatched tenant references now return actionable admin errors.
- **2026-04-06:** Chatbot admin upload/list/ask now validates tenant integrity before data writes and returns actionable `400` errors for invalid tenant-module mappings (instead of opaque `500`/FK errors).
- **2026-03-20**: Added Chatbot module API docs (public ask + tenant admin config/upload/ask endpoints).

### File location

- **API Developer Guide:** `docs/API_DEVELOPER_GUIDE.md`
- **Admin Support:** This guide is exposed at Admin → Support → API Docs

---

## Deployment Troubleshooting

### "Unable to load products" or similar API errors

When your frontend is deployed (e.g. DigitalOcean App Platform, Vercel, Netlify), the app URL often differs from your tenant's domain. The backend must identify the tenant to serve products.

**Required build-time environment variables:**

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Full API URL, e.g. `https://api.adeptlogics.com` |
| `VITE_TENANT_ID` | Tenant UUID (preferred) – from Super Admin → Tenants |
| `VITE_TENANT_DOMAIN` | Fallback: tenant's domain, e.g. `kentuckytopprops.com` |

**Set at least one of** `VITE_TENANT_ID` or `VITE_TENANT_DOMAIN` in your deployment platform's build environment.

- **VITE_TENANT_ID** – Most reliable. Copy the tenant UUID from Super Admin.
- **VITE_TENANT_DOMAIN** – Use when you don't have the UUID. Must match the tenant's `domain` in the database (with or without `www`).

**Checklist:**
1. `VITE_API_BASE_URL` points to your backend (no trailing slash).
2. `VITE_TENANT_ID` or `VITE_TENANT_DOMAIN` is set.
3. Tenant has the Products module assigned (Super Admin → Tenants → tenant → Modules).
4. Your deployment origin (e.g. `https://xxx.ondigitalocean.app`) is CORS-allowed; `*.ondigitalocean.app` is allowed by default.

**Debug:** Open DevTools → Network, trigger a products request, and inspect the failing request URL and response body for the exact error.

---

## Deployment Troubleshooting

If you see **"Unable to load products"** or similar errors when your frontend is deployed (e.g. DigitalOcean, Vercel, Netlify):

### 1. Set build-time environment variables

Your deployment must have these configured (as build-time env vars, not runtime):

| Variable | Required | Description |
|----------|-----------|-------------|
| `VITE_API_BASE_URL` | Yes | Full API URL, e.g. `https://api.adeptlogics.com` |
| `VITE_TENANT_ID` | Preferred | Tenant UUID from Super Admin |
| `VITE_TENANT_DOMAIN` | Fallback | Tenant domain (e.g. `kentuckytopprops.com`) when `VITE_TENANT_ID` is not set |

**Why:** When deployed to a URL like `xxx.ondigitalocean.app`, the backend cannot resolve the tenant from the `Origin` header (it doesn’t match your tenant’s domain). You must pass `tenantId` or `domain` explicitly.

### 2. Verify in DigitalOcean App Platform

- App → Settings → App-Level Environment Variables
- Add `VITE_API_BASE_URL` and `VITE_TENANT_ID` (or `VITE_TENANT_DOMAIN`)
- Ensure they are marked as **build-time** (not runtime) so they are available during `vite build`

### 3. Check CORS

The backend allows `*.ondigitalocean.app`, `*.vercel.app`, `*.netlify.app`, etc. If you use a custom domain, add it in **Admin → Domains** or **Super Admin → Global CORS origins**.

### 4. Confirm Products module is assigned

In **Super Admin**, ensure the Products module is enabled for your tenant.

---

## Changelog

- **2026-03-20:** Added CMS structured `cssSettings` configuration documentation (color/font field-level settings) using `POST /tenants/:tenantId/modules`.
- **2026-04-06:** Documented that production requests must use the Nest global prefix: public endpoints are at **`/api/public/...`** (e.g. `GET https://api.adeptlogics.com/api/public/pages`), not `/public/...` alone.
- **2026-03-13:** Fixed admin `pages` tenant authorization handling to allow super-admin access with selected tenant context and return proper `403` responses for forbidden tenant actions (instead of silent success payloads).
- **2026-03-13:** Added compatibility routing for legacy non-prefixed API paths (e.g., `/auth/*`, `/users/*`, `/tenants/*`, `/modules/*`, `/public/*`) so requests are safely mapped to `/api/*`.
- **2026-03-13:** Added backward-compatible auth routing so legacy `/auth/*` requests are accepted and mapped to `/api/auth/*` (global-prefixed API remains the primary path).
- **2026-03-08:** Added reusable Header/Footer variants under Webpages with tenant defaults, page-level selector (`header_variant_id`, `footer_variant_id`), and public resolved output (`resolved_header`, `resolved_footer`).
- **2026-03-08:** Added Webpages reusable Blocks module (categories, library blocks, schedules, and page insertion via linked/detached modes) with tenant-scoped admin APIs.
- **2026-03-08:** `/public/pages` now resolves reusable blocks at render time and applies schedule filtering using tenant timezone (fallback `UTC`).
- **2026-03-08:** `/public/products` now includes `previewImageUrl`, `previewThumbnailUrl`, `previewImageId`, and `previewAltText` for first-image rendering without relation joins.
- **2026-03-08:** `/public/products` now includes `imageCount` so frontend product cards can display image totals without loading full image relations.
- **2026-03-08:** Products public list endpoint now retries with minimal joins if the primary joined query fails, reducing intermittent `500` errors on `/public/products`.
- **Surveys:** Scheduling – activate/deactivate by date or date range (active_from, active_until)
- **Surveys:** New module – questionnaires, questions with conditional logic, response submission
- **Products:** Pagination, filters, sort options
- **Products:** `categoryId`, `categorySlug`, `q`, `featured`, `minPriceCents`, `maxPriceCents`, etc.
- **Products:** Response format `{ items, total, limit, offset }` for list endpoint
