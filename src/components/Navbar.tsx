import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { logoutUser } from '../services/auth';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, userData } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  function getDashboardLink(): string {
    switch (userData?.role) {
      case 'super_admin': return '/admin';
      case 'seller': return '/seller';
      case 'delivery_person': return '/delivery';
      default: return '/';
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">MobileZone</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {currentUser ? (
          <>
            {userData?.role === 'user' && (
              <Link to="/cart" className="cart-link">
                Cart ({totalItems})
              </Link>
            )}
            <Link to={getDashboardLink()}>Dashboard</Link>
            <span className="nav-user">{userData?.displayName || userData?.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
