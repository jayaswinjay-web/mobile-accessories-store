import { useState, useEffect } from 'react';
import { getAllUsers, getAllOrders } from '../../services/firestore';
import type { AppUser, Order } from '../../types';
import '../Dashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usrs, ords] = await Promise.all([getAllUsers(), getAllOrders()]);
        setUsers(usrs);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading-screen">Loading admin dashboard...</div>;

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const roleCounts = {
    super_admin: users.filter(u => u.role === 'super_admin').length,
    user: users.filter(u => u.role === 'user').length,
    seller: users.filter(u => u.role === 'seller').length,
    delivery_person: users.filter(u => u.role === 'delivery_person').length,
  };

  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      <p className="dashboard-subtitle">Platform Overview</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Customers</h3>
          <p className="stat-value">{roleCounts.user}</p>
        </div>
        <div className="stat-card">
          <h3>Sellers</h3>
          <p className="stat-value">{roleCounts.seller}</p>
        </div>
        <div className="stat-card">
          <h3>Delivery Personnel</h3>
          <p className="stat-value">{roleCounts.delivery_person}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-value">&#8377;{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="dashboard-links">
        <a href="/admin/users" className="dash-link">Manage Users</a>
        <a href="/admin/sellers" className="dash-link">Manage Sellers</a>
        <a href="/admin/deliveries" className="dash-link">Manage Deliveries</a>
      </div>

      <h2>Recent Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(order => (
              <tr key={order.id}>
                <td>#{order.id.slice(0, 8)}</td>
                <td>{order.userId.slice(0, 8)}...</td>
                <td>{order.items.length}</td>
                <td>&#8377;{order.totalAmount.toLocaleString()}</td>
                <td><span className={`order-status status-${order.status}`}>{order.status}</span></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
