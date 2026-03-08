export function ServiceCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-line skeleton-title" style={{ height: "1.25rem", width: "70%", marginBottom: "0.5rem" }} />
      <div className="skeleton skeleton-line skeleton-desc" style={{ height: "0.875rem", width: "100%" }} />
    </div>
  );
}
