import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerOrders, updateOrderStatus } from '../../services/firestore';
import type { Order } from '../../types';
import '../Dashboard.css';

export default function SellerOrders() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const data = await getSellerOrders(userData.uid);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  async function handleUpdateStatus(orderId: string, status: Order['status']) {
    await updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: Date.now() } : o));
  }

  if (loading) return <div className="loading-screen">Loading orders...</div>;

  return (
    <div className="dashboard-page">
      <h1>Orders Received</h1>

      {orders.length === 0 ? (
        <p>No orders received yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id.slice(0, 8)}</td>
                <td>{order.userId.slice(0, 8)}...</td>
                <td>
                  {order.items.map((item, i) => (
                    <div key={i}>{item.name} x{item.quantity}</div>
                  ))}
                </td>
                <td>&#8377;{order.totalAmount.toLocaleString()}</td>
                <td>
                  <span className={`order-status status-${order.status}`}>{order.status}</span>
                </td>
                <td>
                  {order.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="btn-sm">
                      Confirm
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'shipped')} className="btn-sm">
                      Mark Shipped
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
