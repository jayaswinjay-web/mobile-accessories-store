import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>MobileZone</h4>
              <p>Your one-stop shop for premium mobile accessories from top brands.</p>
            </div>
            <div>
              <h5>Quick Links</h5>
              <a href="/">Home</a>
              <a href="/cart">Cart</a>
              <a href="/orders">Orders</a>
            </div>
            <div>
              <h5>Categories</h5>
              <a href="/?category=Phone+Cases">Phone Cases</a>
              <a href="/?category=Chargers">Chargers</a>
              <a href="/?category=Headphones">Headphones</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} MobileZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
