import { Link } from 'react-router-dom';
import type { Product } from '../types';
import './ProductCard.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image">
          <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} />
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-brand">{product.brand}</p>
          <p className="product-price">&#8377;{product.price.toLocaleString()}</p>
          {product.stockQuantity > 0 ? (
            <p className="in-stock">In Stock</p>
          ) : (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      </Link>
    </div>
  );
}
