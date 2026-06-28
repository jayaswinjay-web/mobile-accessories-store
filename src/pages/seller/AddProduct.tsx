import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { addProduct, getCategories } from '../../services/firestore';
import { uploadImage } from '../../services/storage';
import type { Category } from '../../types';
import '../Dashboard.css';

export default function AddProduct() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userData) return;
    setLoading(true);
    setError('');

    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const url = await uploadImage(file, `${userData.uid}/${Date.now()}`);
        imageUrls.push(url);
      }

      await addProduct({
        name,
        description,
        price: Number(price),
        category,
        brand,
        stockQuantity: Number(stockQuantity),
        images: imageUrls,
        sellerId: userData.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
      });

      navigate('/seller/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <h1>Add Product</h1>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (&#8377;)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} min="0" required />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Product Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setImages(Array.from(e.target.files || []))}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
