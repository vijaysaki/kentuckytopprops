### Website breadcrumb behavior (category-agnostic product URLs)

We keep product detail pages category-agnostic:

- Product detail: `/products/:slug`
- Category listing: `/category/:categorySlug` (or any route you prefer)

When a user navigates from a category listing to a product detail page, the category context is preserved in the URL as a query param:

- From category page link to product: `/products/:slug?fromCategory=:categorySlug`

On the product detail page:

- If `fromCategory` exists and resolves to a valid category slug for the current tenant, show breadcrumb:
  - `Home > {Category Name} > {Product Name}`
- Otherwise (direct visit, search result, shared link), show breadcrumb:
  - `Home > Products > {Product Name}` (or `Home > {Product Name}` if you prefer)

Notes:

- This is purely UI/navigation context. The product is still fetched by slug only.
- The category slug used for breadcrumb MUST be tenant-scoped, meaning the backend (or website) resolves it under the current tenant.
- If gated products exist (future), the product detail endpoint should enforce visibility; breadcrumb rendering does not override access rules.

