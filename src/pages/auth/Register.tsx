import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';
import type { UserRole } from '../../types';
import './Auth.css';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, displayName, role);
      const path = role === 'super_admin' ? '/admin' : role === 'seller' ? '/seller' : role === 'delivery_person' ? '/delivery' : '/';
      navigate(path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Create Account</h1>
          <p>Join MobileZone today</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Re-enter password" />
          </div>
          <div className="auth-field">
            <label htmlFor="role">I want to</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="user">Buy Products (Customer)</option>
              <option value="seller">Sell Products (Seller)</option>
              <option value="delivery_person">Deliver Products (Delivery Partner)</option>
            </select>
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
