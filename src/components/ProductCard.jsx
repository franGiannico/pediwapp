import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const price = product.promotionalPrice || product.price;

  function goToDetail() {
    navigate(`/producto/${product.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToDetail();
    }
  }

  function handleAdd(e) {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="product-card">
      <div
        className="product-image"
        onClick={goToDetail}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="no-image">Sin imagen</div>
        )}
      </div>
      <div className="product-info">
        <h3 onClick={goToDetail} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
          {product.name}
        </h3>
        <div className="product-price">
          {product.promotionalPrice ? <span className="price-old">${product.price.toFixed(2)}</span> : null}
          <span className="price">${price.toFixed(2)}</span>
        </div>
        <button type="button" className={`add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
          {added ? '✓ Agregado' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}
