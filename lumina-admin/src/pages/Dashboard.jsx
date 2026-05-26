import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await client.get('/admin/stats');
        if (response.success) {
          setStats(response.data.stats);
          setRecentOrders(response.data.recentOrders);
        } else {
          setError(response.message || 'Failed to fetch dashboard metrics.');
        }
      } catch (err) {
        setError('An unexpected error occurred loading dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-spinner"></div>
        <span>Loading Admin Console...</span>
      </div>
    );
  }

  if (error) {
    return <div className="admin-page-error">{error}</div>;
  }

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Welcome to the Lumina Studios administrative control panel.</p>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <section className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{Math.round(stats.totalRevenue).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Link to="/orders" className="stat-card link-card">
          <div className="stat-icon orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
        </Link>

        <div className="stat-card">
          <div className="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats.pendingOrders}</span>
          </div>
        </div>

        <Link to="/users" className="stat-card link-card">
          <div className="stat-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Customers</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </Link>
      </section>

      {/* Recent Orders Section */}
      <section className="dashboard-section recent-orders-section">
        <div className="section-header">
          <h2>Recent Bookings & Sales</h2>
          <Link to="/orders" className="view-all-link">View All Orders →</Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Receiver Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`} className="table-order-id">
                        #LUM-{order.id}
                      </Link>
                    </td>
                    <td><strong>{order.delivery_name}</strong></td>
                    <td className="table-email">{order.email || 'guest@lumina.com'}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</td>
                    <td className="table-amount">₹{Math.round(order.total_amount)}</td>
                    <td>
                      <span className={`status-badge payment ${order.payment_status}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge order ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="table-action-btn">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
