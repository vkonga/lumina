import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders } from '../api/order.api';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';
import logoImg from '../assets/logo.png';
import './OrdersView.css';

// Import assets from src/assets to match the image mapping
import frameImg from '../assets/frame.png';
import teeImg from '../assets/tee.png';
import mugImg from '../assets/mug.png';
import hoodieImg from '../assets/hoodie.png';
import floatingFrameImg from '../assets/floating_frame.png';
import candleImg from '../assets/candle.png';

const imageMap = {
  'frame.png': frameImg,
  'tee.png': teeImg,
  'mug.png': mugImg,
  'hoodie.png': hoodieImg,
  'floating_frame.png': floatingFrameImg,
  'candle.png': candleImg
};

const OrdersView = ({ onNavigate, onOpenCart }) => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        if (res.success) {
          // The response has been normalized to { success: true, data: [...] }
          setOrders(res.data || []);
        } else {
          setError(res.message || 'Failed to retrieve order history.');
        }
      } catch (err) {
        setError(err.message || 'A network error occurred while retrieving order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, onNavigate]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    onNavigate('login');
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'payment-paid';
      case 'failed': return 'payment-failed';
      case 'pending':
      default:
        return 'payment-pending';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
      case 'cod': return 'Cash on Delivery';
      case 'razorpay': return 'Online Payment';
      default: return method || 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="orders-page-view loading-state">
        <h2 className="title-serif gold-text">Loading Your Orders...</h2>
      </div>
    );
  }

  return (
    <div className="orders-page-view">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}>Portfolio</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'services'); }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); }}>Store</a>
          <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); }}>My Orders</a>
        </div>
        <div className="nav-actions">
          {!isAuthenticated ? (
            <button className="btn-outline" onClick={() => onNavigate('login')}>Sign In</button>
          ) : (
            <button className="btn-outline" onClick={handleLogout}>Sign Out</button>
          )}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg
              className="bag-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={onOpenCart}
              style={{ cursor: 'pointer' }}
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#f1d592',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: '700',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ margin: 'auto' }}>{cartCount}</span>
              </span>
            )}
          </div>
          
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button 
          className="mobile-menu-close" 
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="mobile-nav-links">
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); setMobileMenuOpen(false); }}>Portfolio</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'services'); setMobileMenuOpen(false); }}>Services</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); setMobileMenuOpen(false); }}>Store</a>
          <a href="#" className="mobile-nav-link active" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>My Orders</a>
          {!isAuthenticated ? (
            <a href="#" className="mobile-nav-link" style={{ color: '#c3a168', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); onNavigate('login'); setMobileMenuOpen(false); }}>Sign In</a>
          ) : (
            <a href="#" className="mobile-nav-link" style={{ color: '#ff6b6b', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }}>Sign Out</a>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <header className="orders-header">
        <span className="orders-kicker">Order Tracking</span>
        <h1 className="orders-title">Your Order History</h1>
        <p className="orders-desc">
          Review and monitor the status of your premium keepsake prints, custom layouts, and digital purchases.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="orders-container">
        {error && (
          <div className="error-alert">
            <p>{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h3>No Orders Placed Yet</h3>
            <p>Your premium gallery and print history is currently empty. Explore our Boutique Store to place your first order.</p>
            <button className="btn-gold" onClick={() => onNavigate('store')}>EXPLORE STORE</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Order Overview Header */}
                  <div className="order-card-header" onClick={() => toggleOrderDetails(order.id)}>
                    <div className="header-info-group">
                      <span className="order-id">#SDP-{order.id}</span>
                      <span className="order-date">{formatDate(order.created_at)}</span>
                    </div>

                    <div className="header-metrics-group">
                      <div className="total-metric">
                        <span className="label">Amount</span>
                        <span className="value">₹{Math.round(order.total_amount)}</span>
                      </div>
                      
                      <div className="badges-group">
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                        <span className={`status-badge ${getPaymentStatusClass(order.payment_status)}`}>
                          {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'failed' ? 'Payment Failed' : 'Payment Pending'}
                        </span>
                      </div>

                      <div className="expand-trigger-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="order-card-details">
                      {/* Sub-grid of Delivery & Payment Info */}
                      <div className="details-subgrid">
                        <div className="details-card">
                          <h4>Delivery Address</h4>
                          <p className="recipient-name">{order.delivery_name}</p>
                          <p className="address-text">{order.delivery_address}</p>
                          <p className="address-location">{order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}</p>
                          <p className="phone-text"><span>Phone:</span> {order.delivery_phone}</p>
                          {order.notes && (
                            <p className="notes-text"><span>Instructions:</span> "{order.notes}"</p>
                          )}
                        </div>

                        <div className="details-card">
                          <h4>Payment Information</h4>
                          <div className="info-row">
                            <span className="label">Method:</span>
                            <span className="value">{getPaymentMethodLabel(order.payment_method)}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Fulfillment Status:</span>
                            <span className="value text-capitalize">{order.status || 'Pending'}</span>
                          </div>
                          {order.razorpay_payment_id && (
                            <div className="info-row">
                              <span className="label">Transaction ID:</span>
                              <span className="value code-text">{order.razorpay_payment_id}</span>
                            </div>
                          )}
                          {order.payment_type && (
                            <div className="info-row">
                              <span className="label">Payment Type:</span>
                              <span className="value text-capitalize">{order.payment_type}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items Summary list */}
                      <div className="order-items-summary">
                        <h4>Ordered Items</h4>
                        <div className="items-list">
                          {order.items && order.items.map((item, idx) => {
                            // Parse color name|hex
                            const colorParts = item.custom_color ? item.custom_color.split('|') : [];
                            const colorName = colorParts[0] || '';
                            const colorHex  = colorParts[1] || '';

                            return (
                              <div key={item.id || idx} className="item-row">
                                <div className="item-img-container">
                                  <img 
                                    src={imageMap[item.image] || item.image} 
                                    alt={item.title} 
                                    className="item-thumb"
                                  />
                                  {item.custom_image && (
                                    <div className="custom-photo-badge" title="Click to view custom photo" onClick={() => window.open(item.custom_image, '_blank')}>
                                      <img src={item.custom_image} alt="custom snapshot" />
                                    </div>
                                  )}
                                </div>

                                <div className="item-core-details">
                                  <div className="item-category-header">
                                    <span className="category">{item.category}</span>
                                    {item.custom_image && <span className="custom-tag">✦ Customized</span>}
                                  </div>
                                  <span className="item-title">{item.title}</span>
                                  
                                  <div className="item-options-row">
                                    {item.size && (
                                      <span className="option-badge">Size: {item.size}</span>
                                    )}
                                    {colorHex && (
                                      <div className="color-indicator">
                                        <span className="color-dot" style={{ backgroundColor: colorHex }}></span>
                                        <span className="color-name">{colorName}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="item-pricing-details">
                                  <span className="unit-pricing">₹{Math.round(item.unit_price)} × {item.quantity}</span>
                                  <span className="subtotal-pricing">₹{Math.round(item.unit_price * item.quantity)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="home-footer" style={{ borderTop: '1px solid rgba(195,161,104,0.1)', background: '#050505', marginTop: '6rem' }}>
        <div className="footer-logo-large" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="social-icons" style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
          <a href="https://www.instagram.com/sd_photography_durga?igsh=YTM5Z3BlNGJoM3li" target="_blank" rel="noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.youtube.com/@sdphotographytuni7234" target="_blank" rel="noreferrer" title="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </a>
          <a href="https://wa.me/919666296956" target="_blank" rel="noreferrer" title="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
            </svg>
          </a>
        </div>
        <div className="footer-copyright" style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          © 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default OrdersView;
