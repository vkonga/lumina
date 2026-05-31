import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const getPaymentMethodDisplay = (order) => {
  if (order.payment_method === 'cod') {
    return 'Cash on Delivery';
  } else if (order.payment_method === 'razorpay') {
    const type = order.payment_type ? order.payment_type.toUpperCase() : 'ONLINE';
    return `Razorpay (${type})`;
  }
  return order.payment_method ? order.payment_method.toUpperCase() : 'ONLINE';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment_status: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/admin/orders';
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.payment_status) params.push(`payment_status=${filters.payment_status}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await client.get(url);
      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.message || 'Failed to fetch orders list.');
      }
    } catch (err) {
      setError('An unexpected error occurred loading orders data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      payment_status: ''
    });
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Order Management</h1>
          <p className="subtitle">Track client requests, delivery statuses, custom snapshots, and payment completions.</p>
        </div>
      </header>

      {/* Filters Toolbar */}
      <section className="admin-toolbar">
        <div className="filter-group">
          <div className="select-wrapper">
            <label>Order Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="select-wrapper">
            <label>Payment Status</label>
            <select name="payment_status" value={filters.payment_status} onChange={handleFilterChange}>
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {(filters.status || filters.payment_status) && (
            <button className="btn-secondary reset-filters-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Orders List Table */}
      {loading ? (
        <div className="admin-page-loading">
          <div className="admin-spinner"></div>
          <span>Loading bookings...</span>
        </div>
      ) : error ? (
        <div className="admin-page-error">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Receiver Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                    No bookings found matching selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} className="table-order-id">
                          #SDP-{order.id}
                        </Link>
                      </td>
                      <td><strong>{order.delivery_name}</strong></td>
                      <td className="table-email">{order.email || 'customer@sdphotography.in'}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</td>
                      <td className="table-amount">₹{Math.round(order.total_amount).toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`status-badge payment ${order.payment_status}`}>
                            {order.payment_status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: '500' }}>
                            {getPaymentMethodDisplay(order)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge order ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <Link to={`/orders/${order.id}`} className="table-action-btn">
                            Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
