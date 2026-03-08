import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
import { fetchProductsPage } from "./api/public";

// Minimal Product and ProductCategory types
type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  descriptionHtml?: string;
  priceCents?: string | null;
  currency?: string | null;
};

type ProductCategory = {
  id: string;
  name: string;
  slug?: string;
};

function ProductsCategoryPage({ categories }: { categories: ProductCategory[] }) {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [pageSize, setPageSize] = useState(20);
  const pageParam = Number(searchParams.get("page") || "1");
  const requestedPage = Number.isFinite(pageParam) ? pageParam : 1;
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductsPage({
      page: requestedPage,
      pageSize,
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

export default function App() {
  // Example categories for demonstration
  const categories: ProductCategory[] = [
    { id: "1", name: "Category One", slug: "cat-one" },
    { id: "2", name: "Category Two", slug: "cat-two" },
  ];

  return (
    <Routes>
      <Route path="/products/:categorySlug" element={<ProductsCategoryPage categories={categories} />} />
      {/* Add more routes/components as needed */}
    </Routes>
  );
}
