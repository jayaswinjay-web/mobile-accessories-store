import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getCategories } from '../services/firestore';
import { logoutUser } from '../services/auth';
import type { Category } from '../types';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, userData } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  }

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  function getDashboardLink(): string {
    switch (userData?.role) {
      case 'super_admin': return '/admin';
      case 'seller': return '/seller';
      case 'delivery_person': return '/delivery';
      default: return '/orders';
    }
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-inner">
          <Link to="/" className="logo">MobileZone</Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search Mobile Accessories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
          </form>

          <div className="header-actions">
            {currentUser ? (
              <div className="user-menu" ref={userMenuRef}>
                <button className="user-menu-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
                  </svg>
                  <span className="user-name">{userData?.displayName || 'Account'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">{userData?.email}</div>
                    <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      {userData?.role === 'super_admin' ? 'Admin Panel' :
                       userData?.role === 'seller' ? 'Seller Dashboard' :
                       userData?.role === 'delivery_person' ? 'Delivery Dashboard' : 'My Orders'}
                    </Link>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item logout">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="header-btn">Sign In</Link>
                <Link to="/register" className="header-btn primary">Register</Link>
              </>
            )}

            {userData?.role === 'user' && (
              <Link to="/cart" className="cart-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/>
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </div>

      <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="nav-link home-link">Home</Link>
          <div className="nav-categories">
            {categories.map(c => (
              <Link key={c.id} to={`/?category=${encodeURIComponent(c.name)}`} className="nav-link">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
