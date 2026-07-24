import React, { useState } from 'react';
import { auth } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.login({ email, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail(process.env.REACT_APP_DEMO_EMAIL || '');
    setPassword(process.env.REACT_APP_DEMO_PASSWORD || '');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <h1>CryptoTax AI</h1>
          <p>AI-Powered Cryptocurrency Tax Calculator</p>
        </div>
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" className="demo-btn" onClick={fillDemo}>
              Use Demo Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
