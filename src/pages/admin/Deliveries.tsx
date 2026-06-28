import { useState, useEffect } from 'react';
import { getAllDeliveries, getAllUsers, getAllOrders, createDelivery, updateOrderStatus } from '../../services/firestore';
import type { Delivery, AppUser, Order } from '../../types';
import '../Dashboard.css';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<AppUser[]>([]);
  const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignOrderId, setAssignOrderId] = useState('');
  const [assignPersonId, setAssignPersonId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [dels, users, ords] = await Promise.all([
          getAllDeliveries(),
          getAllUsers(),
          getAllOrders(),
        ]);
        setDeliveries(dels);
        setDeliveryPersons(users.filter(u => u.role === 'delivery_person' && u.status === 'active'));
        setShippedOrders(ords.filter(o => o.status === 'shipped'));
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignOrderId || !assignPersonId) return;
    try {
      const deliveryId = await createDelivery({
        orderId: assignOrderId,
        deliveryPersonId: assignPersonId,
        status: 'assigned',
        pickupAddress: 'Seller warehouse',
        deliveryAddress: '',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await updateOrderStatus(assignOrderId, 'shipped', assignPersonId);
      setDeliveries(prev => [...prev, {
        id: deliveryId,
        orderId: assignOrderId,
        deliveryPersonId: assignPersonId,
        status: 'assigned',
        pickupAddress: 'Seller warehouse',
        deliveryAddress: '',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }]);
      setAssignOrderId('');
      setAssignPersonId('');
    } catch (err) {
      console.error('Failed to assign:', err);
    }
  }

  if (loading) return <div className="loading-screen">Loading deliveries...</div>;

  return (
    <div className="dashboard-page">
      <h1>Manage Deliveries</h1>

      {shippedOrders.length > 0 && (
        <form onSubmit={handleAssign} className="assign-form">
          <h2>Assign Delivery</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Order</label>
              <select value={assignOrderId} onChange={e => setAssignOrderId(e.target.value)} required>
                <option value="">Select shipped order</option>
                {shippedOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id.slice(0, 8)} - &#8377;{o.totalAmount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Delivery Person</label>
              <select value={assignPersonId} onChange={e => setAssignPersonId(e.target.value)} required>
                <option value="">Select delivery person</option>
                {deliveryPersons.map(p => (
                  <option key={p.uid} value={p.uid}>{p.displayName}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Assign</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Delivery ID</th>
            <th>Order ID</th>
            <th>Delivery Person</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
            <tr key={delivery.id}>
              <td>#{delivery.id.slice(0, 8)}</td>
              <td>#{delivery.orderId.slice(0, 8)}</td>
              <td>{delivery.deliveryPersonId.slice(0, 8)}...</td>
              <td>
                <span className={`order-status status-${delivery.status === 'delivered' ? 'delivered' : 'pending'}`}>
                  {delivery.status}
                </span>
              </td>
              <td>{new Date(delivery.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
