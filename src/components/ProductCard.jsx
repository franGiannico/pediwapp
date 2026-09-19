import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const price = product.promotionalPrice || product.price;

  return (
    <div className="product-card">
      <div className="product-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="no-image">Sin imagen</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-price">
          {product.promotionalPrice ? <span className="price-old">${product.price.toFixed(2)}</span> : null}
          <span className="price">${price.toFixed(2)}</span>
        </div>
        <button type="button" onClick={() => addItem(product)}>
          Agregar
        </button>
      </div>
    </div>
  );
}
