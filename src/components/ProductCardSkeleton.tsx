export function ProductCardSkeleton() {
  return (
    <div className="card product-card">
      <div className="skeleton card-image skeleton-image" style={{ aspectRatio: "4/3" }} />
      <div className="skeleton skeleton-line skeleton-title" style={{ height: "1.25rem", width: "80%", marginBottom: "0.5rem" }} />
      <div className="skeleton skeleton-line skeleton-desc" style={{ height: "0.875rem", width: "100%", marginBottom: "0.5rem" }} />
      <div className="skeleton skeleton-line skeleton-meta" style={{ height: "0.875rem", width: "40%" }} />
    </div>
  );
}
