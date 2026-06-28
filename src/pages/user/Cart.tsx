import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, totalAmount, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty container">
        <div className="cart-empty-card">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
            <circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/>
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
          </svg>
          <h2>Your Shopping Cart is empty</h2>
          <p>Discover great deals on mobile accessories!</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const deliveryCharge = totalAmount > 499 ? 0 : 49;
  const finalAmount = totalAmount + deliveryCharge;

  return (
    <div className="cart-page container">
      <h1 className="cart-title">Shopping Cart ({totalItems} items)</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.productId} className="cart-item-card">
              <div className="cart-item-image">
                <img src={item.image || '/mobile-accessories-store/placeholder.svg'} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">&#8377;{item.price.toLocaleString()}</p>
                <div className="cart-item-controls">
                  <div className="cart-qty-selector">
                    <button onClick={() => item.quantity > 1 && updateQty(item.productId, item.quantity - 1)} className="qty-btn">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => item.quantity < 10 && updateQty(item.productId, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="cart-remove-btn">Delete</button>
                </div>
              </div>
              <div className="cart-item-total">
                &#8377;{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({totalItems})</span>
              <span>&#8377;{totalAmount.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? <span className="free">FREE</span> : `&#8377;${deliveryCharge}`}</span>
            </div>
            {deliveryCharge === 0 && (
              <p className="delivery-note">Free delivery on orders above &#8377;499</p>
            )}
            <hr className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>&#8377;{finalAmount.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="btn-checkout">Proceed to Buy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
