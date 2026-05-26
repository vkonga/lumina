import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartQuantity, deleteCartItem, clearCartItems } from '../store/cartSlice';
import './CartDrawer.css';
import CheckoutModal from './CheckoutModal';

// Import assets from src/assets to match the image mapping
import frameImg from '../assets/frame.png';
import teeImg from '../assets/tee.png';
import mugImg from '../assets/mug.png';

const imageMap = {
  'frame.png': frameImg,
  'tee.png': teeImg,
  'mug.png': mugImg
};

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Calculate total price
  const subtotal = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price) || 0;
    return acc + (price * item.quantity);
  }, 0);

  const handleQtyChange = (productId, selectedSize, currentQty, increment) => {
    if (loading) return;
    const newQty = currentQty + increment;
    if (newQty <= 0) {
      dispatch(deleteCartItem({ productId, selectedSize }));
    } else {
      dispatch(updateCartQuantity({ productId, quantity: newQty, selectedSize }));
    }
  };

  const handleRemove = (productId, selectedSize) => {
    if (loading) return;
    dispatch(deleteCartItem({ productId, selectedSize }));
  };

  const handleClear = () => {
    if (loading || cartItems.length === 0) return;
    if (window.confirm('Are you sure you want to clear your boutique cart?')) {
      dispatch(clearCartItems());
    }
  };

  return (
    <>
      {/* Background blur backdrop overlay */}
      <div 
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <header className="cart-header">
          <h2 className="cart-title">
            Your Bag
            <span>Elite Boutique Collection</span>
          </h2>
          <button className="btn-close-cart" onClick={onClose} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Cart items list */}
        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <svg className="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <h3 className="cart-empty-text">Your bag is empty</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Explore the boutique collection to add elite items.
              </p>
            </div>
          ) : (
            cartItems.map((item) => {
              // Parse color name|hex stored as "ColorName|#hexcode"
              const colorParts = item.custom_color ? item.custom_color.split('|') : [];
              const colorName = colorParts[0] || '';
              const colorHex  = colorParts[1] || '';

              // Decide which image to show: custom upload takes priority
              const displayImage = item.custom_image
                ? item.custom_image
                : (imageMap[item.image] || item.image);

              return (
                <div className="cart-item" key={item.cart_item_id || `${item.product_id}-${item.selected_size}`}>
                  {/* Thumbnail — custom image shows as small inset on product */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={imageMap[item.image] || item.image}
                      alt={item.title}
                      className="cart-item-img"
                    />
                    {item.custom_image && (
                      <img
                        src={item.custom_image}
                        alt="Custom photo"
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          width: 32,
                          height: 32,
                          objectFit: 'cover',
                          borderRadius: 4,
                          border: '1.5px solid rgba(195,161,104,0.7)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      />
                    )}
                  </div>

                  <div className="cart-item-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="cart-item-category">{item.category}</span>
                      {item.custom_image && (
                        <span style={{
                          fontSize: '0.55rem',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          color: '#c3a168',
                          fontWeight: 700,
                          background: 'rgba(195,161,104,0.1)',
                          border: '1px solid rgba(195,161,104,0.25)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}>
                          ✦ Custom
                        </span>
                      )}
                    </div>
                    <h4 className="cart-item-name">{item.title}</h4>

                    {/* Size */}
                    {item.selected_size && (
                      <span className="cart-item-size" style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'rgba(195,161,104,0.7)',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginTop: '4px',
                        marginBottom: '2px'
                      }}>
                        Size: {item.selected_size}
                      </span>
                    )}

                    {/* Color swatch */}
                    {colorHex && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%',
                          background: colorHex,
                          border: '1px solid rgba(255,255,255,0.2)',
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
                          {colorName}
                        </span>
                      </div>
                    )}

                    <span className="cart-item-price">₹{Math.round(parseFloat(item.price))}</span>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          className="btn-qty"
                          onClick={() => handleQtyChange(item.product_id, item.selected_size, item.quantity, -1)}
                          disabled={loading}
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="btn-qty"
                          onClick={() => handleQtyChange(item.product_id, item.selected_size, item.quantity, 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn-remove-item"
                        onClick={() => handleRemove(item.product_id, item.selected_size)}
                        disabled={loading}
                        aria-label="Remove item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2.18 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary section */}
        {cartItems.length > 0 && (
          <footer className="cart-footer">
            <div className="cart-summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{Math.round(subtotal)}</span>
            </div>
            
            <div className="cart-actions">
              <button 
                className="btn-checkout" 
                onClick={() => {
                  onClose();
                  setIsCheckoutOpen(true);
                }}
              >
                PROCEED TO CHECKOUT
              </button>
              
              <button 
                className="btn-clear-all" 
                onClick={handleClear}
                disabled={loading}
              >
                CLEAR BAG
              </button>
            </div>
          </footer>
        )}
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        cartItems={cartItems} 
        subtotal={subtotal} 
      />
    </>
  );
};

export default CartDrawer;
