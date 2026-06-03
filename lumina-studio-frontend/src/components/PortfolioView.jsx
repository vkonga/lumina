import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData } from '../store/homeSlice';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';
import logoImg from '../assets/logo.png';

const PortfolioView = ({ onNavigate, onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.home);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHomeData());
    }
  }, [status, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    onNavigate('login');
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0e0d' }}>
        <h2 className="title-serif gold-text">Loading Portfolio...</h2>
      </div>
    );
  }

  const { portfolioVideos, siteContent } = data || {};
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="portfolio-page-view" style={{ backgroundColor: '#050505', color: '#f5f5f5', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link active" style={{ color: 'var(--lumina-gold)' }}>Portfolio</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'services'); }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); }}>Store</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'contact'); }}>Contact</a>
          {isAuthenticated && (
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('orders'); }}>My Orders</a>
          )}
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
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'services'); setMobileMenuOpen(false); }}>Services</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); setMobileMenuOpen(false); }}>Store</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home', 'contact'); setMobileMenuOpen(false); }}>Contact</a>
          {isAuthenticated && (
            <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('orders'); setMobileMenuOpen(false); }}>My Orders</a>
          )}
          {!isAuthenticated ? (
            <a href="#" className="mobile-nav-link" style={{ color: '#c3a168', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); onNavigate('login'); setMobileMenuOpen(false); }}>Sign In</a>
          ) : (
            <a href="#" className="mobile-nav-link" style={{ color: '#ff6b6b', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }}>Sign Out</a>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="portfolio-header gallery-section">
        <span className="portfolio-subtitle">Elite Cinematic Showcases</span>
        <h1 className="portfolio-title">Our Portfolio</h1>
        <p className="portfolio-desc">
          Explore our collection of 11 breathtaking showreels, traditional mandap chronicles, and candid prelude features captured in raw, cinematic clarity.
        </p>
      </header>

      {/* Dynamic YouTube Video Portfolio Grid Section */}
      <main className="portfolio-content gallery-section">
        <div className="portfolio-video-grid">
          {portfolioVideos && portfolioVideos.map((video) => (
            <div key={video.id} className="portfolio-video-card">
              <div className="video-wrapper">
                <iframe
                  src={video.url}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <h4>
                  {video.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-logo-large" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        
        <div className="footer-links-row" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <a href="#" className="footer-link" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }} onClick={(e) => { e.preventDefault(); setShowLocations(!showLocations); }}>Locations</a>
          <a href="#" className="footer-link" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }} onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Terms</a>
          <a href="#" className="footer-link" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }} onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Privacy</a>
        </div>
        
        {showLocations && (
          <div className="locations-dropdown" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(195, 161, 104, 0.2)',
            borderRadius: '6px',
            padding: '1.25rem 1.5rem',
            maxWidth: '380px',
            margin: '0 auto 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h4 style={{ color: '#c3a168', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: 0 }}>Our Studio Address</h4>
            <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
              <a 
                href="https://maps.app.goo.gl/NZgWFq66GPUj4uae9?g_st=iw" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#c3a168'}
                onMouseLeave={(e) => e.target.style.color = '#ccc'}
              >
                9G2F+V27, Bypass Rd, MP Peta, Tuni, Annavaram Suravaram, Andhra Pradesh 533401
              </a>
            </p>
            <a 
              href="https://maps.app.goo.gl/NZgWFq66GPUj4uae9?g_st=iw" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#c3a168', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Get Directions ↗
            </a>
          </div>
        )}
        <div className="footer-contact-info" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {siteContent?.contact_email && (
            <a href={`mailto:${siteContent.contact_email}`} className="footer-contact-link" style={{ textTransform: 'lowercase', color: 'var(--lumina-white)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {siteContent.contact_email}
            </a>
          )}
          {siteContent?.contact_phone && (
            <a href={`tel:${siteContent.contact_phone}`} className="footer-contact-link" style={{ color: 'var(--lumina-white)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {siteContent.contact_phone}
            </a>
          )}
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
        <div className="footer-copyright">
          © 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING.
        </div>
      </footer>
    </div>
  );
};

export default PortfolioView;
