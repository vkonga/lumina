import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Permanently delete account "${user.username}" (${user.email})?\n\nThis action cannot be undone. Their orders will be retained for records.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const response = await client.delete(`/admin/users/${user.id}`);
      if (response.success) {
        // Redirect to users list with a message
        navigate('/users', {
          state: { successMsg: response.data?.message || `User "${user.username}" deleted successfully.` }
        });
      } else {
        setError(response.message || 'Failed to delete user.');
        setDeleting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the user.');
      setDeleting(false);
    }
  };

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
            <h3>Booking &amp; Order History</h3>
            
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
                              #SDP-{order.id}
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

          {/* Danger Zone — only for non-admin users */}
          {!user.is_admin && (
            <div className="detail-card" style={{
              border: '1px solid rgba(220,53,69,0.25)',
              background: 'rgba(220,53,69,0.03)'
            }}>
              <h3 style={{ color: '#ff6b6b', borderBottomColor: 'rgba(220,53,69,0.2)' }}>
                Danger Zone
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 1.25rem', lineHeight: '1.5' }}>
                Permanently delete this customer account from the platform. Their order history will be
                retained for financial records. This action <strong style={{ color: '#ff6b6b' }}>cannot
                be undone</strong>.
              </p>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: deleting ? 'rgba(220,53,69,0.06)' : 'rgba(220,53,69,0.1)',
                  border: '1px solid rgba(220,53,69,0.35)',
                  borderRadius: '6px',
                  color: '#ff6b6b',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: deleting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = 'rgba(220,53,69,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(220,53,69,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = 'rgba(220,53,69,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(220,53,69,0.35)';
                  }
                }}
              >
                {deleting ? (
                  <>
                    <span style={{
                      width: '14px', height: '14px', border: '2px solid rgba(255,107,107,0.3)',
                      borderTopColor: '#ff6b6b', borderRadius: '50%',
                      display: 'inline-block', animation: 'adminSpin 0.7s linear infinite'
                    }} />
                    Deleting Account…
                  </>
                ) : (
                  <>
                    🗑 Delete Account Permanently
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
