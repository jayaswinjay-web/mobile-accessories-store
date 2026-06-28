import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import type { Product } from '../../types';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { currentUser, userData } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const p = await getProductById(id);
        setProduct(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '',
      sellerId: product.sellerId,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (loading) return <div className="loading-screen">Loading product details...</div>;
  if (!product) return <div className="loading-screen">Product not found.</div>;

  const images = product.images.length > 0 ? product.images : ['/mobile-accessories-store/placeholder.svg'];
  const discount = product.price > 999 ? Math.floor(Math.random() * 30 + 10) : 0;
  const originalPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : 0;

  const specs = [
    { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.category },
    { label: 'Condition', value: 'New' },
    { label: 'Warranty', value: '6 Months' },
  ];

  return (
    <div className="pd container">
      <nav className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={images[selectedImage]} alt={product.name} />
            {discount > 0 && <span className="pd-discount">-{discount}%</span>}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <p className="pd-brand">{product.brand}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <div className="pd-stars">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= 4 ? '#febd69' : '#ddd'} stroke="#febd69" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <span className="pd-rating-text">4.0 (128 ratings)</span>
          </div>

          <div className="pd-price-section">
            <div className="pd-price-row">
              <span className="pd-current-price">&#8377;{product.price.toLocaleString()}</span>
              {originalPrice > 0 && (
                <>
                  <span className="pd-original-price">&#8377;{originalPrice.toLocaleString()}</span>
                  <span className="pd-discount-text">{discount}% off</span>
                </>
              )}
            </div>
            <p className="pd-tax-info">inclusive of all taxes</p>
          </div>

          <div className="pd-specs">
            {specs.map(s => (
              <div key={s.label} className="pd-spec-row">
                <span className="pd-spec-label">{s.label}</span>
                <span className="pd-spec-value">{s.value}</span>
              </div>
            ))}
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-availability">
            {product.stockQuantity > 0 ? (
              <span className="pd-in-stock">In Stock ({product.stockQuantity} units)</span>
            ) : (
              <span className="pd-out-of-stock">Currently unavailable</span>
            )}
          </div>

          <div className="pd-actions">
            <div className="pd-qty">
              <label>Quantity:</label>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                {Array.from({ length: Math.min(10, Math.max(product.stockQuantity, 1)) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {userData?.role === 'user' && product.stockQuantity > 0 && (
              <button onClick={handleAddToCart} className="pd-add-cart">
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            )}

            {!currentUser && (
              <Link to="/login" className="pd-login-btn">Sign in to purchase</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
