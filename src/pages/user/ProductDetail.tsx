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
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { currentUser, userData } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const p = await getProductById(id);
        setProduct(p);
      } catch (err) {
        console.error('Failed to load product:', err);
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
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return <div className="loading-screen">Loading product details...</div>;
  if (!product) return <div className="loading-screen">Product not found.</div>;

  return (
    <div className="product-detail">
      <Link to="/" className="back-link">&larr; Back to Products</Link>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-brand">{product.brand}</p>
          <p className="product-detail-price">&#8377;{product.price.toLocaleString()}</p>
          <p className="product-detail-desc">{product.description}</p>
          <p className="product-detail-category">Category: {product.category}</p>
          <p className={product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
          </p>

          {userData?.role === 'user' && product.stockQuantity > 0 && (
            <div className="add-to-cart-section">
              <div className="qty-selector">
                <label>Qty:</label>
                <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                  {Array.from({ length: Math.min(10, product.stockQuantity) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAddToCart} className="btn-add-cart">
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          )}

          {!currentUser && (
            <p className="login-to-buy"><Link to="/login">Sign in</Link> to add items to cart.</p>
          )}
          {currentUser && userData?.role !== 'user' && (
            <p className="login-to-buy">Only customers can add items to cart.</p>
          )}
        </div>
      </div>
    </div>
  );
}
