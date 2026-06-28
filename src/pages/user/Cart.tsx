import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h1>Shopping Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({items.length} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.productId} className="cart-item">
              <img src={item.image || '/placeholder.jpg'} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">&#8377;{item.price.toLocaleString()}</p>
                <div className="cart-item-actions">
                  <select
                    value={item.quantity}
                    onChange={e => updateQty(item.productId, Number(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button onClick={() => removeItem(item.productId)} className="btn-remove">Delete</button>
                </div>
              </div>
              <div className="cart-item-total">
                &#8377;{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items:</span>
            <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total:</span>
            <span>&#8377;{totalAmount.toLocaleString()}</span>
          </div>
          <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
