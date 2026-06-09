import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import client from '../api/client';

const Users = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.successMsg || '');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await client.get('/admin/users');
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to load user accounts.');
      }
    } catch (err) {
      setError('An unexpected error occurred loading users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Permanently delete account "${user.username}" (${user.email})?\n\nThis action cannot be undone. Their orders will be retained for records.`
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    setError('');
    setSuccessMsg('');

    try {
      const response = await client.delete(`/admin/users/${user.id}`);
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setSuccessMsg(response.data?.message || `User "${user.username}" deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(response.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Customer Accounts Directory</h1>
          <p className="subtitle">Track registered user profiles, billing history, total expenditures, and administrative staff roles.</p>
        </div>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}
      {successMsg && <div className="admin-success-banner">{successMsg}</div>}

      {loading ? (
        <div className="admin-page-loading">
          <div className="admin-spinner"></div>
          <span>Loading client directory...</span>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Join Date</th>
                <th>Privilege</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/users/${user.id}`} className="table-order-id">
                      #USR-{user.id}
                    </Link>
                  </td>
                  <td><strong>{user.username}</strong></td>
                  <td className="table-email">{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</td>
                  <td>
                    {user.is_admin ? (
                      <span className="status-badge privilege admin-badge">✦ Admin</span>
                    ) : (
                      <span className="status-badge privilege user-badge">Customer</span>
                    )}
                  </td>
                  <td>{user.order_count} bookings</td>
                  <td className="table-amount" style={{ color: '#c3a168', fontWeight: '600' }}>
                    ₹{Math.round(parseFloat(user.total_spent)).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/users/${user.id}`} className="table-action-btn">
                        View
                      </Link>
                      {!user.is_admin && (
                        <button
                          className="table-action-btn"
                          style={{
                            background: deletingId === user.id ? 'rgba(220,53,69,0.08)' : 'none',
                            border: '1px solid rgba(220,53,69,0.4)',
                            color: '#ff6b6b',
                            cursor: deletingId === user.id ? 'not-allowed' : 'pointer',
                            opacity: deletingId === user.id ? 0.6 : 1,
                          }}
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          title={`Delete ${user.username}`}
                        >
                          {deletingId === user.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
