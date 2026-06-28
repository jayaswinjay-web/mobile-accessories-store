import { Link } from 'react-router-dom';
import type { Product } from '../types';
import './ProductCard.css';

interface Props {
  product: Product;
}

function StarRating({ rating = 4.0 }: { rating?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= full ? '#febd69' : i === full + 1 && half ? '#febd69' : '#ddd'} stroke="#febd69" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product }: Props) {
  const discount = product.price > 999 ? Math.floor(Math.random() * 30 + 10) : 0;
  const originalPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.images[0] || '/mobile-accessories-store/placeholder.svg'} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
      </div>
      <div className="product-card-body">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-title">{product.name}</h3>
        <StarRating />
        <div className="product-card-pricing">
          <span className="product-card-price">&#8377;{product.price.toLocaleString()}</span>
          {originalPrice > 0 && (
            <span className="product-card-original">&#8377;{originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="product-card-meta">
          {product.stockQuantity > 5 ? (
            <span className="delivery-badge">Free Delivery</span>
          ) : product.stockQuantity > 0 ? (
            <span className="stock-warning">Only {product.stockQuantity} left</span>
          ) : (
            <span className="out-of-stock-badge">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
