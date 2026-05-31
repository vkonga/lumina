import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

// Local assets mapping (matching CartDrawer/CheckoutModal)
import frameImg from '../assets/frame.png';
import teeImg from '../assets/tee.png';
import mugImg from '../assets/mug.png';

const imageMap = {
  'frame.png': frameImg,
  'tee.png': teeImg,
  'mug.png': mugImg
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Dropdown states
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrderDetail = async () => {
    try {
      const response = await client.get(`/admin/orders/${id}`);
      if (response.success) {
        setOrder(response.data);
        setStatus(response.data.status);
        setPaymentStatus(response.data.payment_status);
      } else {
        setError(response.message || 'Failed to load order details.');
      }
    } catch (err) {
      setError('An unexpected error occurred reading order data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess('');
    setError('');

    try {
      const response = await client.patch(`/admin/orders/${id}`, {
        status,
        payment_status: paymentStatus
      });

      if (response.success) {
        setOrder(response.data.order);
        setUpdateSuccess('Order status updated successfully.');
        setTimeout(() => setUpdateSuccess(''), 4000);
      } else {
        setError(response.message || 'Failed to update order status.');
      }
    } catch (err) {
      setError('An unexpected error occurred during update.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-spinner"></div>
        <span>Loading order details...</span>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="admin-page-container">
        <div className="admin-page-error">{error}</div>
        <Link to="/orders" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <header className="admin-page-header detail-header">
        <div>
          <Link to="/orders" className="back-nav-link">← Back to Orders</Link>
          <div className="title-row">
            <h1>Order #LUM-{order.id}</h1>
            <div className="badge-row">
              <span className={`status-badge order ${order.status}`}>{order.status}</span>
              <span className={`status-badge payment ${order.payment_status}`}>{order.payment_status}</span>
            </div>
          </div>
          <p className="subtitle">
            Placed on {new Date(order.created_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </header>

      {updateSuccess && <div className="admin-success-banner">{updateSuccess}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="order-detail-grid">
        {/* Left Side: Order items list */}
        <div className="detail-col-main">
          
          <div className="detail-card">
            <h3>Cart Contents Summary</h3>
            <div className="detail-items-list">
              {order.items?.map((item) => {
                const imageSrc = imageMap[item.image] || item.image;
                
                // Parse color hex if custom color matches standard palette
                let colorHex = '';
                if (item.custom_color) {
                  const colors = {
                    'Classic Black': '#080808',
                    'Elegant White': '#fcfcfc',
                    'Royal Maroon': '#5f0f1a',
                    'Golden Cream': '#eae4d3',
                    'Navy Blue': '#112233'
                  };
                  colorHex = colors[item.custom_color] || '';
                }

                return (
                  <div key={item.id} className="detail-item-card">
                    {/* Image Thumbnail with custom preview overlay */}
                    <div className="item-thumbnail-container">
                      <img src={imageSrc} alt={item.title} className="base-thumbnail" />
                      {item.custom_image && (
                        <a href={item.custom_image} target="_blank" rel="noreferrer" title="Click to view full custom upload">
                          <img src={item.custom_image} alt="User Upload" className="inset-custom-thumbnail" />
                        </a>
                      )}
                    </div>

                    <div className="item-card-details">
                      <span className="item-category">{item.category}</span>
                      <h4>{item.title}</h4>
                      
                      <div className="item-attributes-grid">
                        {item.size && (
                          <div className="item-attribute">
                            <span>Selected Size:</span>
                            <strong>{item.size}</strong>
                          </div>
                        )}

                        {item.custom_color && (
                          <div className="item-attribute">
                            <span>Custom Color:</span>
                            <div className="color-preview-row">
                              {colorHex && (
                                <span className="color-circle" style={{ backgroundColor: colorHex }}></span>
                              )}
                              <strong>{item.custom_color}</strong>
                            </div>
                          </div>
                        )}

                        {item.custom_image && (
                          <div className="item-attribute">
                            <span>Custom Image:</span>
                            <a href={item.custom_image} target="_blank" rel="noreferrer" className="custom-image-link">
                              View Uploaded Photo ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="item-price-quantity">
                      <span className="item-price-label">Unit Price</span>
                      <strong className="item-price-value">₹{Math.round(item.unit_price)}</strong>
                      <span className="item-quantity-val">&times; {item.quantity}</span>
                      <span className="item-subtotal-val">₹{Math.round(item.unit_price * item.quantity)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="detail-total-bar">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{Math.round(order.total_amount)}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span className="free">FREE</span>
              </div>
              <div className="total-row final-total">
                <span>Grand Total Amount</span>
                <span>₹{Math.round(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping & Fulfillment Actions */}
        <div className="detail-col-sidebar">
          
          {/* Action Card: Update Status */}
          <div className="detail-card action-card">
            <h3>Manage Booking Status</h3>
            <form onSubmit={handleStatusUpdate} className="status-update-form">
              <div className="form-group">
                <label>Fulfillment Stage</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Ledger</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="pending">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed / Declined</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <button type="submit" className="btn-primary update-status-btn" disabled={updateLoading}>
                {updateLoading ? 'Saving...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Card: Payment Information */}
          <div className="detail-card info-card">
            <h3>Payment Ledger Details</h3>
            
            <div className="info-block">
              <span>Payment Gateway</span>
              <strong>
                {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 
                 order.payment_method === 'razorpay' ? 'Razorpay Gateway' : 
                 (order.payment_method ? order.payment_method.toUpperCase() : 'Not Specified')}
              </strong>
            </div>

            {order.payment_method === 'razorpay' && (
              <>
                <div className="info-block">
                  <span>Payment Type / Method</span>
                  <strong style={{ textTransform: 'uppercase', color: '#c3a168' }}>{order.payment_type || 'ONLINE'}</strong>
                </div>

                <div className="info-block">
                  <span>Razorpay Order ID</span>
                  <code style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                    {order.razorpay_order_id || 'N/A'}
                  </code>
                </div>

                <div className="info-block">
                  <span>Razorpay Payment ID</span>
                  <code style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                    {order.razorpay_payment_id || 'N/A'}
                  </code>
                </div>
              </>
            )}
          </div>

          {/* Card: Delivery Information */}
          <div className="detail-card info-card">
            <h3>Shipping Details</h3>
            <div className="info-block">
              <span>Receiver Full Name</span>
              <strong>{order.delivery_name}</strong>
            </div>

            <div className="info-block">
              <span>Phone Contact</span>
              <strong>{order.delivery_phone}</strong>
            </div>

            <div className="info-block">
              <span>Street Address</span>
              <p className="address-paragraph">{order.delivery_address}</p>
            </div>

            <div className="info-block-inline">
              <div className="info-block">
                <span>City</span>
                <strong>{order.delivery_city}</strong>
              </div>
              <div className="info-block">
                <span>State</span>
                <strong>{order.delivery_state}</strong>
              </div>
              <div className="info-block">
                <span>Pincode</span>
                <strong>{order.delivery_pincode}</strong>
              </div>
            </div>

            {order.notes && (
              <div className="info-block">
                <span>User Checkout Note</span>
                <p className="note-bubble">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Card: Customer Profile */}
          <div className="detail-card info-card">
            <h3>Customer Account</h3>
            <div className="info-block">
              <span>Username</span>
              <strong>{order.username || 'Unregistered Guest'}</strong>
            </div>

            <div className="info-block">
              <span>Registered Email</span>
              <strong>{order.email || 'guest@lumina.com'}</strong>
            </div>

            {order.user_id && (
              <Link to={`/users/${order.user_id}`} className="view-profile-btn">
                View Customer Profile →
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
