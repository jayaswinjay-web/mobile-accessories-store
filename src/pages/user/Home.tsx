import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/firestore';
import ProductCard from '../../components/ProductCard';
import type { Product, Category } from '../../types';
import './Home.css';

const HERO_BANNERS = [
  {
    title: 'Premium Mobile Accessories',
    subtitle: 'Cases, Chargers, Earphones & More',
    description: 'Top brands at unbeatable prices. Free delivery on orders above &#8377;499.',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter(p => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const banner = HERO_BANNERS[0];

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="home">
      <section className="hero-banner" style={{ background: banner.gradient }}>
        <div className="container">
          <div className="hero-content">
            <h1>{banner.title}</h1>
            <p className="hero-subtitle">{banner.subtitle}</p>
            <p className="hero-desc" dangerouslySetInnerHTML={{ __html: banner.description }} />
            <a href="#products" className="hero-cta">{banner.cta}</a>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <div className="category-grid">
          {categories.map(c => (
            <a key={c.id} href={`/?category=${encodeURIComponent(c.name)}`} className="category-card">
              <div className="category-icon">
                {c.name === 'Phone Cases' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6"/><circle cx="12" cy="16" r="1"/>
                  </svg>
                )}
                {c.name === 'Chargers' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <path d="M15 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3"/><path d="M6 7H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3"/><path d="M12 3v18"/><path d="m9 9 3-3 3 3"/>
                  </svg>
                )}
                {c.name === 'Cables' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <path d="M8 4h8"/><path d="M6 8h12"/><rect x="4" y="12" width="16" height="8" rx="2"/>
                  </svg>
                )}
                {c.name === 'Headphones' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <path d="M3 14h3v7H3zM18 14h3v7h-3z"/><path d="M3 14v-2a9 9 0 0 1 18 0v2"/>
                  </svg>
                )}
                {c.name === 'Screen Protectors' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="3"/><path d="M8 2v20M16 2v20"/>
                  </svg>
                )}
                {c.name === 'Power Banks' && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="18" r="1"/>
                  </svg>
                )}
              </div>
              <span className="category-name">{c.name}</span>
            </a>
          ))}
        </div>
      </section>

      {(searchTerm || selectedCategory) && (
        <section className="container" style={{ marginTop: '2rem' }}>
          <div className="search-info">
            {searchTerm && <p>Results for "<strong>{searchTerm}</strong>"</p>}
            {selectedCategory && <p>Category: <strong>{selectedCategory}</strong></p>}
            <a href="/" className="clear-filter">Clear all filters</a>
          </div>
        </section>
      )}

      <section id="products" className="container products-section">
        <h2 className="section-title">{searchTerm || selectedCategory ? 'Search Results' : 'Featured Products'}</h2>
        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="no-results">
            <p>No products found matching your criteria.</p>
            <a href="/" className="btn-primary">Browse All Products</a>
          </div>
        )}
      </section>
    </div>
  );
}
