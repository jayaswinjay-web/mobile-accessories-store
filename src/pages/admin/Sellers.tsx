import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../../services/firestore';
import type { AppUser } from '../../types';
import '../Dashboard.css';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allUsers = await getAllUsers();
        setSellers(allUsers.filter(u => u.role === 'seller'));
      } catch (err) {
        console.error('Failed to load sellers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleToggleStatus(seller: AppUser) {
    const newStatus = seller.status === 'active' ? 'suspended' : 'active';
    await updateUserStatus(seller.uid, newStatus);
    setSellers(prev => prev.map(s => s.uid === seller.uid ? { ...s, status: newStatus } : s));
  }

  if (loading) return <div className="loading-screen">Loading sellers...</div>;

  return (
    <div className="dashboard-page">
      <h1>Manage Sellers</h1>
      {sellers.length === 0 ? (
        <p>No sellers registered yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(seller => (
              <tr key={seller.uid}>
                <td>{seller.displayName}</td>
                <td>{seller.email}</td>
                <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`order-status status-${seller.status === 'active' ? 'delivered' : 'cancelled'}`}>
                    {seller.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleToggleStatus(seller)} className="btn-sm">
                    {seller.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
