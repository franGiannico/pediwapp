export default function CategoryTabs({ categories, active, onSelect }) {
  return (
    <div className="category-tabs">
      <button type="button" className={active === '' ? 'active' : ''} onClick={() => onSelect('')}>
        Todos
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={String(active) === String(c.id) ? 'active' : ''}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
