import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('lumina_admin_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        email,
        password
      });

      const { token, user } = response.data;

      // Verify the user is an admin
      if (!user.is_admin) {
        setError('Access denied. You do not have administrator privileges.');
        setLoading(false);
        return;
      }

      // Store credentials and redirect
      localStorage.setItem('lumina_admin_token', token);
      localStorage.setItem('lumina_admin_user', JSON.stringify(user));
      
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="login-box">
        <div className="login-logo">
          <h1>Lumina</h1>
          <span>ADMIN DASHBOARD</span>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label>Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@lumina.com"
              required
            />
          </div>

          <div className="login-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Console'}
          </button>
        </form>

        <div className="login-help-text">
          <p>Lumina Studios Administrative Access Console.</p>
          <p className="hint">Default credential is admin@lumina.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
