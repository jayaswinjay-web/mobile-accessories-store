import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerProducts, updateProduct } from '../../services/firestore';
import type { Product } from '../../types';
import '../Dashboard.css';

export default function SellerProducts() {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userData) return;
      try {
        const data = await getSellerProducts(userData.uid);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userData]);

  async function handleToggleStatus(product: Product) {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await updateProduct(product.id, { status: newStatus });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
  }

  if (loading) return <div className="loading-screen">Loading products...</div>;

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <h1>My Products</h1>
        <a href="/seller/add-product" className="btn-primary">Add Product</a>
      </div>

      {products.length === 0 ? (
        <p>No products yet. Add your first product!</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <img src={product.images[0] || '/placeholder.jpg'} alt="" className="table-thumb" />
                </td>
                <td>{product.name}</td>
                <td>&#8377;{product.price.toLocaleString()}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <span className={`order-status status-${product.status === 'active' ? 'delivered' : 'cancelled'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleToggleStatus(product)} className="btn-sm">
                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
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
