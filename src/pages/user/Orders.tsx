import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../services/firestore';
import type { Order } from '../../types';
import './Orders.css';

const STATUS_FLOW: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  shipped: 3,
  delivered: 4,
};

export default function Orders() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const data = await getUserOrders(userData.uid);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  const justPlaced = searchParams.get('placed') === 'true';

  if (loading) return <div className="loading-screen">Loading orders...</div>;

  return (
    <div className="orders container">
      {justPlaced && (
        <div className="order-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <strong>Order placed successfully!</strong>
            <p>You'll receive a confirmation shortly.</p>
          </div>
        </div>
      )}

      <h1 className="orders-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>No orders yet.</p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const step = STATUS_FLOW[order.status] || 0;
            const isCancelled = order.status === 'cancelled';
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id-label">ORDER #</span>
                    <span className="order-id-value">{order.id.slice(0, 12).toUpperCase()}</span>
                  </div>
                  <span className={`order-badge ${order.status}`}>{order.status.toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                {!isCancelled && (
                  <div className="order-track">
                    {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((s, i) => (
                      <div key={s} className={`track-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'current' : ''}`}>
                        <div className="track-dot" />
                        <span className="track-label">{s}</span>
                      </div>
                    ))}
                    <div className="track-line" />
                  </div>
                )}

                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <img src={item.image || '/mobile-accessories-store/placeholder.svg'} alt={item.name} />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="order-item-price">&#8377;{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-footer-left">
                    <span className="order-payment">Payment: {order.paymentMethod.toUpperCase()}</span>
                    <span className="order-address">Deliver to: {order.shippingAddress}</span>
                  </div>
                  <div className="order-total">
                    Total: <strong>&#8377;{order.totalAmount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
