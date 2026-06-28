import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDeliveriesForPerson } from '../../services/firestore';
import type { Delivery } from '../../types';
import '../Dashboard.css';

export default function DeliveryDashboard() {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const data = await getDeliveriesForPerson(userData.uid);
        setDeliveries(data);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  if (loading) return <div className="loading-screen">Loading deliveries...</div>;

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered' && d.status !== 'failed');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <div className="dashboard-page">
      <h1>Delivery Dashboard</h1>
      <p className="dashboard-subtitle">Welcome, {userData?.displayName}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Deliveries</h3>
          <p className="stat-value">{activeDeliveries.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-value">{completedDeliveries.length}</p>
        </div>
      </div>

      <div className="dashboard-links">
        <a href="/delivery/tasks" className="dash-link">View Tasks</a>
      </div>

      <h2>Active Deliveries</h2>
      {activeDeliveries.length === 0 ? (
        <p>No active deliveries assigned.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Pickup</th>
              <th>Delivery</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {activeDeliveries.map(d => (
              <tr key={d.id}>
                <td>#{d.orderId.slice(0, 8)}</td>
                <td><span className={`order-status status-${d.status === 'delivered' ? 'delivered' : 'pending'}`}>{d.status}</span></td>
                <td>{d.pickupAddress}</td>
                <td>{d.deliveryAddress || 'Pending'}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
