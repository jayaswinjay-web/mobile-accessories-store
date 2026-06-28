import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDeliveriesForPerson, updateDeliveryStatus, updateOrderStatus } from '../../services/firestore';
import type { Delivery } from '../../types';
import '../Dashboard.css';

export default function DeliveryTasks() {
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
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  async function handleUpdateStatus(delivery: Delivery, newStatus: Delivery['status']) {
    try {
      await updateDeliveryStatus(delivery.id, newStatus);
      if (newStatus === 'delivered') {
        await updateOrderStatus(delivery.orderId, 'delivered');
      }
      setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, status: newStatus, updatedAt: Date.now() } : d));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  function getNextAction(delivery: Delivery): { status: Delivery['status']; label: string } | null {
    switch (delivery.status) {
      case 'assigned': return { status: 'picked_up', label: 'Mark Picked Up' };
      case 'picked_up': return { status: 'in_transit', label: 'Mark In Transit' };
      case 'in_transit': return { status: 'delivered', label: 'Mark Delivered' };
      default: return null;
    }
  }

  if (loading) return <div className="loading-screen">Loading tasks...</div>;

  return (
    <div className="dashboard-page">
      <h1>My Delivery Tasks</h1>

      {deliveries.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Pickup Address</th>
              <th>Delivery Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(delivery => {
              const nextAction = getNextAction(delivery);
              return (
                <tr key={delivery.id}>
                  <td>#{delivery.orderId.slice(0, 8)}</td>
                  <td>
                    <span className={`order-status status-${delivery.status === 'delivered' ? 'delivered' : 'pending'}`}>
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{delivery.pickupAddress}</td>
                  <td>{delivery.deliveryAddress || 'Not set'}</td>
                  <td>
                    {nextAction && (
                      <button onClick={() => handleUpdateStatus(delivery, nextAction.status)} className="btn-sm">
                        {nextAction.label}
                      </button>
                    )}
                    {delivery.status === 'delivered' && (
                      <span className="order-status status-delivered">Completed</span>
                    )}
                    {delivery.status === 'failed' && (
                      <span className="order-status status-cancelled">Failed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
