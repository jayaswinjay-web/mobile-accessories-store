import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/firestore';
import './Checkout.css';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order is delivered' },
  { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
  { value: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
];

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(userData?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const deliveryCharge = totalAmount > 499 ? 0 : 49;
  const finalAmount = totalAmount + deliveryCharge;

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!userData || !address.trim()) {
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
        totalAmount: finalAmount,
        status: 'pending',
        shippingAddress: address,
        paymentMethod,
        sellerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      clearCart();
      navigate('/orders?placed=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout container">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Address</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Payment</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Review</span>
        </div>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          {error && <div className="checkout-error">{error}</div>}

          {step === 1 && (
            <div className="checkout-section">
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
              <button onClick={() => setStep(2)} className="btn-primary">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-grid">
                {PAYMENT_OPTIONS.map(opt => (
                  <label key={opt.value} className={`payment-card ${paymentMethod === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-card-content">
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="checkout-nav">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-section">
              <h2>Review Your Order</h2>
              <div className="review-address">
                <strong>Shipping to:</strong>
                <p>{address}</p>
                <button onClick={() => setStep(1)} className="link-btn">Change</button>
              </div>
              <div className="review-payment">
                <strong>Payment:</strong>
                <p>{PAYMENT_OPTIONS.find(o => o.value === paymentMethod)?.label}</p>
                <button onClick={() => setStep(2)} className="link-btn">Change</button>
              </div>
              <div className="review-items">
                <strong>Items ({items.length}):</strong>
                {items.map((item, i) => (
                  <div key={i} className="review-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>&#8377;{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-nav">
                <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button onClick={handlePlaceOrder} className="btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : `Place Order - &#8377;${finalAmount.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({items.length})</span>
              <span>&#8377;{totalAmount.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? <span className="free">FREE</span> : `&#8377;${deliveryCharge}`}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span>&#8377;{finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
