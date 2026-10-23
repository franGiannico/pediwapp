import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { api } from '../api/client.js';

// El catálogo se guarda en memoria mientras la app esté abierta: al volver
// desde el detalle de un producto aparece al instante (y se actualiza en
// segundo plano), en vez de mostrar "Cargando" y perder el lugar.
let catalogCache = null;

// Posición del scroll por pantalla (clave = ruta + filtros), para volver
// exactamente al mismo lugar de la lista.
const SCROLL_PREFIX = 'pediwapp_scroll:';

function readScroll(key) {
  try {
    return Number(sessionStorage.getItem(SCROLL_PREFIX + key)) || 0;
  } catch {
    return 0;
  }
}

function writeScroll(key, y) {
  try {
    sessionStorage.setItem(SCROLL_PREFIX + key, String(Math.round(y)));
  } catch {
    // sin sessionStorage: simplemente no se recuerda el scroll
  }
}

export default function Catalog() {
  // La categoría y la búsqueda viven en la dirección (?cat=...&q=...): así,
  // al entrar a un producto y tocar "Volver" (o la flecha atrás del celular)
  // el catálogo reaparece con el mismo filtro.
  const [params, setParams] = useSearchParams();
  const category = params.get('cat') || '';
  const search = params.get('q') || '';
  const location = useLocation();
  const scrollKey = location.pathname + location.search;

  const [products, setProducts] = useState(catalogCache ? catalogCache.products : []);
  const [categories, setCategories] = useState(catalogCache ? catalogCache.categories : []);
  const [loading, setLoading] = useState(!catalogCache);
  const [error, setError] = useState('');

  const setFilter = useCallback(
    (key, value) => {
      // replace: cambiar el filtro no agrega un paso al historial, así
      // "Volver" no te hace repasar cada letra de la búsqueda.
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, String(value));
          else next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([productsRes, categoriesRes]) => {
        const next = { products: productsRes.products || [], categories: categoriesRes.categories || [] };
        catalogCache = next;
        setProducts(next.products);
        setCategories(next.categories);
        setError('');
      })
      .catch(() => {
        if (!catalogCache) setError('No se pudieron cargar los productos desde Tiendanube. Probá de nuevo en un momento.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !category || p.categories.some((c) => String(c.id) === String(category));
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  // Guarda el scroll mientras se navega la lista...
  const scrollKeyRef = useRef(scrollKey);
  scrollKeyRef.current = scrollKey;
  useEffect(() => {
    let timer = null;
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(() => writeScroll(scrollKeyRef.current, window.scrollY), 120);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, []);

  // ...y lo recupera al volver, apenas la lista está pintada.
  const restoredFor = useRef(null);
  useLayoutEffect(() => {
    if (loading || error || restoredFor.current === scrollKey) return;
    restoredFor.current = scrollKey;
    window.scrollTo(0, readScroll(scrollKey));
  }, [loading, error, scrollKey, filtered.length]);

  return (
    <div className="catalog-screen">
      <Header search={search} onSearchChange={(value) => setFilter('q', value)} />
      {!loading && !error && (
        <CategoryTabs categories={categories} active={category} onSelect={(id) => setFilter('cat', id)} />
      )}
      <main>
        {loading && <p className="empty-state">Cargando productos...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && <ProductGrid products={filtered} />}
      </main>
    </div>
  );
}
