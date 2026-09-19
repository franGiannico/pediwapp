import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { api } from '../api/client.js';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.products || []);
        setCategories(categoriesRes.categories || []);
      })
      .catch(() => setError('No se pudieron cargar los productos desde Tiendanube. Probá de nuevo en un momento.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !category || p.categories.some((c) => String(c.id) === String(category));
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  return (
    <div className="catalog-screen">
      <Header search={search} onSearchChange={setSearch} />
      {!loading && !error && <CategoryTabs categories={categories} active={category} onSelect={setCategory} />}
      <main>
        {loading && <p className="empty-state">Cargando productos...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && <ProductGrid products={filtered} />}
      </main>
    </div>
  );
}
