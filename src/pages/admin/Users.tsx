import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../services/firestore';
import type { AppUser, UserRole } from '../../types';
import '../Dashboard.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    await updateUserRole(uid, role);
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
  }

  async function handleToggleStatus(user: AppUser) {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateUserStatus(user.uid, newStatus);
    setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, status: newStatus } : u));
  }

  if (loading) return <div className="loading-screen">Loading users...</div>;

  return (
    <div className="dashboard-page">
      <h1>Manage Users</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid}>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.uid, e.target.value as UserRole)}
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="delivery_person">Delivery Person</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </td>
              <td>
                <span className={`order-status status-${user.status === 'active' ? 'delivered' : 'cancelled'}`}>
                  {user.status}
                </span>
              </td>
              <td>
                <button onClick={() => handleToggleStatus(user)} className="btn-sm">
                  {user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
