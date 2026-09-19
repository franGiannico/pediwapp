import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api/client.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getProduct(id)
      .then((res) => {
        setProduct(res.product);
        setActiveImage(0);
        setQty(1);
      })
      .catch(() => setError('No se pudo cargar el producto. Probá de nuevo en un momento.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAdd() {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) {
    return (
      <div className="detail-page">
        <Header />
        <div className="detail-screen">
          <button type="button" className="detail-back" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <p className="empty-state">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-page">
        <Header />
        <div className="detail-screen">
          <button type="button" className="detail-back" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <p className="error">{error || 'Producto no encontrado.'}</p>
        </div>
      </div>
    );
  }

  const price = product.promotionalPrice || product.price;
  const images = product.images?.length ? product.images : [];

  return (
    <div className="detail-page">
      <Header />
      <div className="detail-screen">
        <button type="button" className="detail-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="detail-gallery">
          <div className="detail-main-image">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={product.name} />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={i === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          {product.sku && <p className="detail-sku">SKU: {product.sku}</p>}
          <div className="product-price detail-price">
            {product.promotionalPrice ? <span className="price-old">${product.price.toFixed(2)}</span> : null}
            <span className="price">${price.toFixed(2)}</span>
          </div>

          {product.description && (
            <div className="detail-description" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}
        </div>

        <div className="detail-add-bar">
          <div className="qty-stepper">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Restar cantidad">
              −
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Sumar cantidad">
              +
            </button>
          </div>
          <button type="button" className={`add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? '✓ Agregado al carrito' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
