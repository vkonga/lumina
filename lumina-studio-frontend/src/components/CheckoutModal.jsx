import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import * as orderApi from '../api/order.api';
import './CheckoutModal.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Local asset image mapping (matching CartDrawer.jsx)
import frameImg from '../assets/frame.png';
import teeImg from '../assets/tee.png';
import mugImg from '../assets/mug.png';

const imageMap = {
  'frame.png': frameImg,
  'tee.png': teeImg,
  'mug.png': mugImg
};

const CheckoutModal = ({ isOpen, onClose, cartItems, subtotal }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: Address, 2: Review & Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_pincode: '',
    payment_method: 'cod',
    notes: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate form
      if (
        !formData.delivery_name ||
        !formData.delivery_phone ||
        !formData.delivery_address ||
        !formData.delivery_city ||
        !formData.delivery_state ||
        !formData.delivery_pincode
      ) {
        setError('Please fill in all shipping details.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. If Razorpay is selected, ensure the Razorpay SDK script is loaded first
      if (formData.payment_method === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError('Failed to load Razorpay Payment Gateway script. Please check your internet connection.');
          setLoading(false);
          return;
        }
      }

      // 2. Submit order creation request to backend
      const response = await orderApi.checkout({
        ...formData,
        total_amount: subtotal
      });

      if (!response.success) {
        setError(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Handle Payment Method Branching
      if (formData.payment_method === 'razorpay') {
        const orderData = response.data.order;
        const rzpConfig = response.data.razorpay;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
          amount: rzpConfig.amount,
          currency: rzpConfig.currency,
          name: 'Lumina Studios',
          description: `Order Payment #LUM-${orderData.id}`,
          order_id: rzpConfig.id,
          handler: async function (paymentResponse) {
            setLoading(true);
            setError('');
            try {
              const verifyRes = await orderApi.verifyPayment({
                order_id: orderData.id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              });

              if (verifyRes.success) {
                setOrderId(orderData.id);
                setStep(3);
                dispatch(fetchCart()); // Clear local cart
              } else {
                setError(verifyRes.message || 'Payment signature verification failed.');
              }
            } catch (verifyErr) {
              setError(verifyErr.message || 'An error occurred while verifying the payment.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async function () {
              setLoading(true);
              try {
                await orderApi.failPayment({ order_id: orderData.id });
              } catch (failErr) {
                console.error("Failed to notify backend of cancelled payment:", failErr);
              }
              setError('Payment process was cancelled or closed.');
              setLoading(false);
            }
          },
          prefill: {
            name: formData.delivery_name,
            contact: formData.delivery_phone
          },
          theme: {
            color: '#c3a168'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Standard Cash on Delivery flow
        setOrderId(response.data.order.id);
        setStep(3);
        dispatch(fetchCart()); // Sync cart state to empty
      }
    } catch (err) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      // Do not turn off loading immediately for razorpay since the razorpay modal is open asynchronously,
      // but let's toggle loading off for non-razorpay checkout or error states.
      if (formData.payment_method !== 'razorpay') {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setOrderId(null);
    setError('');
    onClose();
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-container">
        
        {/* Header (Hide in success screen) */}
        {step < 3 && (
          <div className="checkout-modal-header">
            <h2>Checkout</h2>
            <button className="checkout-close-btn" onClick={handleClose}>&times;</button>
          </div>
        )}

        {/* Progress Tracker (Hide in success screen) */}
        {step < 3 && (
          <div className="checkout-progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-circle">1</div>
              <span>Shipping</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <span>Payment & Review</span>
            </div>
          </div>
        )}

        {error && <div className="checkout-error-banner">{error}</div>}

        {/* Step 1: Shipping Form */}
        {step === 1 && (
          <form className="checkout-form" onSubmit={handleNextStep}>
            <div className="checkout-form-grid">
              <div className="form-group full-width">
                <label>Receiver Name *</label>
                <input
                  type="text"
                  name="delivery_name"
                  value={formData.delivery_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="delivery_phone"
                  value={formData.delivery_phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Street Address *</label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  placeholder="Flat/House No., Building, Apartment, Area"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="delivery_city"
                  value={formData.delivery_city}
                  onChange={handleInputChange}
                  placeholder="e.g. New Delhi"
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="delivery_state"
                  value={formData.delivery_state}
                  onChange={handleInputChange}
                  placeholder="e.g. Delhi"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="delivery_pincode"
                  value={formData.delivery_pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 110001"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Order Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>

            <div className="checkout-footer-buttons">
              <button type="button" className="btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Method and Order Review */}
        {step === 2 && (
          <div className="checkout-review-section">
            <div className="checkout-review-grid">
              
              {/* Left Column: Payment & Review Address */}
              <div className="review-col-left">
                <div className="review-card">
                  <h3>Shipping Address</h3>
                  <p><strong>{formData.delivery_name}</strong></p>
                  <p>{formData.delivery_address}</p>
                  <p>{formData.delivery_city}, {formData.delivery_state} - {formData.delivery_pincode}</p>
                  <p>Phone: {formData.delivery_phone}</p>
                  {formData.notes && <p className="notes-text">Notes: {formData.notes}</p>}
                  <button className="change-details-btn" onClick={() => setStep(1)}>Edit Address</button>
                </div>

                <div className="review-card">
                  <h3>Select Payment Method</h3>
                  <div className="payment-options">
                    <label className={`payment-option-card ${formData.payment_method === 'cod' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={formData.payment_method === 'cod'}
                        onChange={handleInputChange}
                      />
                      <div className="option-info">
                        <span className="option-title">Cash on Delivery</span>
                        <span className="option-desc">Pay with cash when order is delivered.</span>
                      </div>
                    </label>

                    <label className={`payment-option-card ${formData.payment_method === 'razorpay' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="razorpay"
                        checked={formData.payment_method === 'razorpay'}
                        onChange={handleInputChange}
                      />
                      <div className="option-info">
                        <span className="option-title">Online Payment (UPI, Card, Netbanking)</span>
                        <span className="option-desc">Pay securely using UPI apps, credit/debit cards, or netbanking via Razorpay.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Items Summary */}
              <div className="review-col-right">
                <div className="review-card summary-card">
                  <h3>Order Summary</h3>
                  <div className="checkout-items-list">
                    {cartItems.map((item) => {
                      const imageSrc = imageMap[item.image] || item.image;
                      return (
                        <div key={item.cart_item_id} className="checkout-item-row">
                          <div className="checkout-item-img-wrapper">
                            <img src={imageSrc} alt={item.title} />
                            {item.quantity > 1 && (
                              <span className="checkout-item-qty-badge">{item.quantity}</span>
                            )}
                          </div>
                          <div className="checkout-item-details">
                            <span className="checkout-item-title">{item.title}</span>
                            {item.selected_size && (
                              <span className="checkout-item-meta">Size: {item.selected_size}</span>
                            )}
                            {item.custom_color && (
                              <span className="checkout-item-meta">Color: {item.custom_color}</span>
                            )}
                          </div>
                          <span className="checkout-item-price">
                            ₹{Math.round(item.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="checkout-price-breakdown">
                    <div className="breakdown-row">
                      <span>Subtotal</span>
                      <span>₹{Math.round(subtotal)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Delivery</span>
                      <span className="free-delivery">FREE</span>
                    </div>
                    <div className="breakdown-total">
                      <span>Total Amount</span>
                      <span>₹{Math.round(subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-footer-buttons">
              <button type="button" className="btn-cancel" onClick={() => setStep(1)} disabled={loading}>
                Back
              </button>
              <button 
                type="button" 
                className="btn-primary place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="checkout-success-view">
            <div className="success-icon-wrapper">
              <svg viewBox="0 0 24 24" className="checkmark-svg">
                <circle cx="12" cy="12" r="11" fill="none" stroke="#c3a168" strokeWidth="2" />
                <path d="M7 12l3 3 7-7" fill="none" stroke="#c3a168" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2>Order Placed Successfully!</h2>
            <p className="success-order-id">Order ID: <strong>#LUM-{orderId}</strong></p>
            <p className="success-subtext">Thank you for shopping with Lumina Studios. Your order has been registered and is currently pending admin confirmation.</p>

            <div className="success-details-summary">
              <h3>Delivery Details</h3>
              <p><strong>Name:</strong> {formData.delivery_name}</p>
              <p><strong>Phone:</strong> {formData.delivery_phone}</p>
              <p><strong>Address:</strong> {formData.delivery_address}, {formData.delivery_city}, {formData.delivery_state} - {formData.delivery_pincode}</p>
              <p><strong>Payment Method:</strong> {formData.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
              <p className="success-total"><strong>Total Paid:</strong> ₹{Math.round(subtotal)}</p>
            </div>

            <button className="btn-primary close-success-btn" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;
