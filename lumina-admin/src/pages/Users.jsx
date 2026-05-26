import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
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

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Customer Accounts Directory</h1>
          <p className="subtitle">Track registered user profiles, billing history, total expenditures, and administrative staff roles.</p>
        </div>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}

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
                <th>Action</th>
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
                      <span className="status-badge privilege admin-badge">
                        ✦ Admin
                      </span>
                    ) : (
                      <span className="status-badge privilege user-badge">
                        Customer
                      </span>
                    )}
                  </td>
                  <td>{user.order_count} bookings</td>
                  <td className="table-amount" style={{ color: '#c3a168', fontWeight: '600' }}>
                    ₹{Math.round(parseFloat(user.total_spent)).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <Link to={`/users/${user.id}`} className="table-action-btn">
                      View Profile
                    </Link>
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
