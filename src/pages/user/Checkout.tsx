import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/firestore';
import './Checkout.css';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(userData?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userData) return;
    if (!address.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sellerId = items[0].sellerId;
      await createOrder({
        userId: userData.uid,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          sellerId: i.sellerId,
        })),
        totalAmount,
        status: 'pending',
        shippingAddress: address,
        paymentMethod,
        sellerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="auth-error">{error}</div>}
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping Address</h2>
          <div className="form-group">
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your full shipping address"
              rows={4}
              required
            />
          </div>

          <h2>Payment Method</h2>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              Credit/Debit Card
            </label>
            <label className="payment-option">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              UPI
            </label>
          </div>

          <button type="submit" className="btn-place-order" disabled={loading}>
            {loading ? 'Processing...' : `Place Order - ₹${totalAmount.toLocaleString()}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.productId} className="checkout-item">
              <span>{item.name} x {item.quantity}</span>
              <span>&#8377;{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-total">
            <span>Total:</span>
            <span>&#8377;{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
