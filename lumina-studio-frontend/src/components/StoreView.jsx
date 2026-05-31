import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { logout } from '../store/authSlice';
import { addItemToCart, resetCart } from '../store/cartSlice';
import '../StoreView.css';
import logoImg from '../assets/logo.png';
import ProductCard from './ProductCard';
import ProductCustomizer from './ProductCustomizer';

// Import assets from src/assets
import frameImg from '../assets/frame.png';
import teeImg from '../assets/tee.png';
import mugImg from '../assets/mug.png';
import hoodieImg from '../assets/hoodie.png';
import floatingFrameImg from '../assets/floating_frame.png';
import candleImg from '../assets/candle.png';
import storeBannerImg from '../assets/store_banner.png';

// Map database image strings to local asset imports
const imageMap = {
  'frame.png': frameImg,
  'tee.png': teeImg,
  'mug.png': mugImg,
  'hoodie.png': hoodieImg,
  'floating_frame.png': floatingFrameImg,
  'candle.png': candleImg
};

// categories will be fetched from database or hardcoded if small
const staticCategories = ['All Collections', 'Frames', 'Gifts', 'Apparel'];

const StoreView = ({ onNavigate, onOpenCart }) => {
  const [activeCategory, setActiveCategory] = useState('All Collections');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customizerProduct, setCustomizerProduct] = useState(null);
  const dispatch = useDispatch();

  const { items: products, siteContent, status, error } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    onNavigate('login');
  };

  useEffect(() => {
    dispatch(fetchProducts(activeCategory));
  }, [activeCategory, dispatch]);

  const handleAddToBag = (productId, selectedSize) => {
    if (!isAuthenticated) {
      alert('Please Sign In or Create an Account to purchase elite collection items.');
      onNavigate('login');
      return;
    }
    dispatch(addItemToCart({ productId, quantity: 1, selectedSize }));
    onOpenCart(); // Auto-open drawer when adding an item!
  };

  if (!siteContent && status === 'succeeded') return null; // Wait for content

  const content = siteContent || {};

  // Count total quantity of items in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="store-view">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}>Portfolio</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Services</a>
          <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); }}>Store</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Contact</a>
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
                justifycontent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ margin: 'auto' }}>{cartCount}</span>
              </span>
            )}
          </div>
          
          {/* Hamburger Mobile Menu Trigger */}
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

      {/* Mobile Glassmorphic Overlay Menu */}
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
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); setMobileMenuOpen(false); }}>Services</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); setMobileMenuOpen(false); }}>Store</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); setMobileMenuOpen(false); }}>Contact</a>
          {isAuthenticated && (
            <a href="#" className="mobile-nav-link" style={{ color: '#ff6b6b', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }}>Sign Out</a>
          )}
        </div>
      </div>

      {/* Premium Boutique Store Banner */}
      <div className="store-banner-container">
        <img src={storeBannerImg} className="store-banner-bg" alt="SD Photography Boutique Banner" />
        <div className="store-banner-overlay">
          <span className="store-banner-kicker">Bespoke Memorabilia</span>
          <h1 className="store-banner-title">
            {content.store_title} <br />
            <span className="title-collection">{content.store_collection}</span>
          </h1>
          <p className="store-banner-desc">
            {content.store_description?.replace(/Lumina's/gi, "SD Photography's").replace(/Lumina Studios/gi, "SD Photography").replace(/Lumina Studio/gi, "SD Photography")}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {staticCategories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Content State Handling */}
      {status === 'loading' && (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2 className="title-serif gold-text" style={{ fontSize: '1.8rem', letterSpacing: '2px' }}>Loading Boutique Collection...</h2>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <p className="error-text" style={{ color: '#d9534f', fontSize: '1.2rem' }}>Failed to load boutique collection: {error}</p>
        </div>
      )}

      {status === 'succeeded' && (
        <section className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              category={product.category.toUpperCase()}
              description={product.description}
              image={imageMap[product.image] || product.image}
              sizes={product.sizes}
              onAddToBag={handleAddToBag}
              onCustomize={(p) => setCustomizerProduct({
                ...p,
                category: product.category,        // raw (lowercase) for palette lookup
                image: imageMap[product.image] || product.image,
              })}
            />
          ))}
        </section>
      )}

      {/* Product Customizer Modal */}
      {customizerProduct && (
        <ProductCustomizer
          product={customizerProduct}
          onClose={() => setCustomizerProduct(null)}
          onOpenCart={onOpenCart}
        />
      )}

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <h2 className="newsletter-title title-serif">{content.newsletter_title}</h2>
          <p className="newsletter-desc">
            {content.newsletter_description}
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              required
            />
            <button type="submit" className="btn-gold">Join the Circle</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="store-footer">
        <div className="footer-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); }}>Locations</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Terms</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Privacy</a>
        </div>

        <div className="footer-contact-info" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          {content.contact_email && (
            <a href={`mailto:${content.contact_email}`} className="footer-link" style={{ textTransform: 'lowercase', display: 'inline-flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {content.contact_email}
            </a>
          )}
          {content.contact_phone && (
            <a href={`tel:${content.contact_phone}`} className="footer-link" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {content.contact_phone}
            </a>
          )}
        </div>

        <p className="copyright">© 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING.</p>
      </footer>
    </div>
  );
};

export default StoreView;
