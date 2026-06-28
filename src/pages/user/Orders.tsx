import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../services/firestore';
import type { Order } from '../../types';
import './Orders.css';

export default function Orders() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const data = await getUserOrders(userData.uid);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  if (loading) return <div className="loading-screen">Loading orders...</div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p className="no-orders">No orders yet. Start shopping!</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id.slice(0, 8)}</span>
              <span className={`order-status status-${order.status}`}>{order.status.toUpperCase()}</span>
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <p>Qty: {item.quantity} x &#8377;{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span>Total: <strong>&#8377;{order.totalAmount.toLocaleString()}</strong></span>
              <span>Payment: {order.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
