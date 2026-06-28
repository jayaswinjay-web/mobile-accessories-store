import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerProducts, getSellerOrders } from '../../services/firestore';
import type { Product, Order } from '../../types';
import '../Dashboard.css';

export default function SellerDashboard() {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const [prods, ords] = await Promise.all([
          getSellerProducts(userData.uid),
          getSellerOrders(userData.uid),
        ]);
        setProducts(prods);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="dashboard-page">
      <h1>Seller Dashboard</h1>
      <p className="dashboard-subtitle">Welcome, {userData?.displayName}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Products</h3>
          <p className="stat-value">{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">&#8377;{totalSales.toLocaleString()}</p>
        </div>
      </div>

      <div className="dashboard-links">
        <a href="/seller/products" className="dash-link">Manage Products</a>
        <a href="/seller/manage-orders" className="dash-link">View Orders</a>
        <a href="/seller/add-product" className="dash-link">Add New Product</a>
      </div>

      <h2>Recent Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
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
                <td>{order.items.length} item(s)</td>
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
