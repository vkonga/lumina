import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await client.get(`/admin/users/${id}`);
        if (response.success) {
          setUser(response.data);
        } else {
          setError(response.message || 'Failed to load user account details.');
        }
      } catch (err) {
        setError('An unexpected error occurred reading user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-spinner"></div>
        <span>Loading customer profile...</span>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="admin-page-container">
        <div className="admin-page-error">{error}</div>
        <Link to="/users" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
          ← Back to Directory
        </Link>
      </div>
    );
  }

  // Calculate user spent totals
  const overallSpent = user.orders?.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0;
  const bookingCount = user.orders?.length || 0;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <header className="admin-page-header detail-header">
        <div>
          <Link to="/users" className="back-nav-link">← Back to Directory</Link>
          <div className="title-row">
            <h1>Customer Profile: {user.username}</h1>
            {user.is_admin && (
              <span className="status-badge privilege admin-badge" style={{ marginLeft: '15px' }}>
                ✦ Administrator
              </span>
            )}
          </div>
          <p className="subtitle">Member since {new Date(user.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="order-detail-grid">
        {/* Left Side: Order History */}
        <div className="detail-col-main">
          <div className="detail-card">
            <h3>Booking & Order History</h3>
            
            <div className="admin-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date Placed</th>
                    <th>Receiver Name</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingCount === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        This user has not placed any orders yet.
                      </td>
                    </tr>
                  ) : (
                    user.orders.map((order) => {
                      const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                      return (
                        <tr key={order.id}>
                          <td>
                            <Link to={`/orders/${order.id}`} className="table-order-id">
                              #LUM-{order.id}
                            </Link>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</td>
                          <td><strong>{order.delivery_name}</strong></td>
                          <td>{itemsCount} items</td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats Summary */}
        <div className="detail-col-sidebar">
          
          <div className="detail-card info-card">
            <h3>Client Summary Metrics</h3>
            
            <div className="info-block">
              <span>Account Username</span>
              <strong>{user.username}</strong>
            </div>

            <div className="info-block">
              <span>Registered Email Contact</span>
              <strong>{user.email}</strong>
            </div>

            <div className="info-block">
              <span>Overall Booking Count</span>
              <strong>{bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}</strong>
            </div>

            <div className="info-block">
              <span>Total Store Expenditure</span>
              <strong style={{ color: '#c3a168', fontSize: '1.4rem' }}>
                ₹{Math.round(overallSpent).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="info-block">
              <span>Join Date Timestamp</span>
              <strong>{new Date(user.created_at).toLocaleString('en-IN')}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetail;
