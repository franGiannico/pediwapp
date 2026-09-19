import { useEffect, useMemo, useRef, useState } from 'react';

export default function CategoryTabs({ categories, active, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const activeCategory = categories.find((c) => String(c.id) === String(active));

  const filtered = useMemo(() => {
    if (!search) return categories;
    const term = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id) {
    onSelect(id);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="category-bar">
      <button type="button" className={active === '' ? 'active' : ''} onClick={() => handleSelect('')}>
        Todos
      </button>

      <div className="category-dropdown-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className={`category-dropdown-toggle ${active !== '' ? 'active' : ''}`}
          onClick={() => setOpen((o) => !o)}
        >
          <span>{activeCategory ? activeCategory.name : 'Categorías'}</span>
          <span className="chevron">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div className="category-dropdown-panel">
            <input
              type="search"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <ul>
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={String(active) === String(c.id) ? 'active' : ''}
                    onClick={() => handleSelect(c.id)}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="no-results">Sin resultados</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
