import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData } from '../store/homeSlice';
import { logout } from '../store/authSlice';
import { resetCart } from '../store/cartSlice';
import '../HomePage.css';
import logoImg from '../assets/logo.png';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=2070&auto=format&fit=crop',
    title: 'Elite Perspective',
    subtitle: 'Creating Memories, Capturing The Most Breathtaking Views'
  },
  {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2070&auto=format&fit=crop',
    title: 'Timeless Artistry',
    subtitle: 'Celebrating Love in its Most Vibrant Traditional Colors'
  },
  {
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=2070&auto=format&fit=crop',
    title: 'Cinematic Elegance',
    subtitle: 'Capturing Every Intimate Glance and Beautiful Detail'
  }
];

const testimonials = [
  {
    quote: "SD Photography didn't just take photos, they captured the soul of our wedding. Every frame feels like a still from a high-end cinematic masterpiece. Truly unparalleled artistry.",
    author: "SAI & HARIKA",
    location: "TUNI, ANDHRA PRADESH"
  },
  {
    quote: "The candid team was invisible yet captured every tear, laugh, and emotional glance. Our family looks like royalty. Absolutely worth every single rupee.",
    author: "MADHU & SRINIVAS",
    location: "TUNI, ANDHRA PRADESH"
  },
  {
    quote: "Their cinematography and live streaming allowed our families across the globe to feel like they were sitting in the mandap with us. Exquisite service and quality.",
    author: "RAMYA & PRASAD",
    location: "TUNI, ANDHRA PRADESH"
  }
];

const serviceDetails = {
  '01': {
    description: "Capturing spontaneous, raw emotions, and beautiful cinematic glances during your traditional ceremonies. Our candid artists preserve the unscripted magic, quiet tears, and joyful laughter in museum-grade clarity.",
    inclusions: "High-resolution edited portraits, luxury digital gallery, handcrafted heirloom leather album, candid team of 3 elite photographers.",
    quote: "Preserving the unscripted stories of your soul."
  },
  '02': {
    description: "Exquisite, cinematic filmmaking that translates your wedding rituals into a high-end luxury feature film. From sweeping drone shots of the baraat to deep emotional close-ups during the pheras.",
    inclusions: "4K Cinematic Trailer (3-5 min), Full Length Wedding Film (40-60 min), Raw footage on gold premium drive, drone coverage, 3 elite cinematographers.",
    quote: "Where your love story becomes cinema."
  },
  '03': {
    description: "Seamless, multi-cam live broadcast of your ceremonies in crystal-clear ultra-high-definition, allowing families and guests across the globe to feel like they are sitting right in the mandap.",
    inclusions: "Private UHD broadcast stream, interactive digital guestbook, live chat integration, multi-camera angle coverage, dedicated network engineer.",
    quote: "Connecting hearts across oceans."
  },
  '04': {
    description: "A breathtaking cinematic shoot set in iconic heritage palaces, tranquil lakes, or sand dunes. Designed to capture your chemistry and tell your romantic prelude story before the grand festivities begin.",
    inclusions: "Premium 4K pre-wedding teaser film, 50 masterfully edited portraits, custom wardrobe consulting, lifestyle venue styling.",
    quote: "The elegant prelude to your forever."
  },
  '05': {
    description: "A quiet, romantic shoot following your grand wedding day. Unhurried, serene, and focusing entirely on your early days of married bliss away from the bustling crowds.",
    inclusions: "Serene post-wedding digital album, 30 fine-art prints, post-ceremony lifestyle film snippet.",
    quote: "In the quiet chapters after the vows."
  },
  '06': {
    description: "Documenting every sacred custom, ritual, and family portrait with strict adherence to authentic traditional framing. Ideal for haldi, mehndi, sangeet, and grand reception group portraits.",
    inclusions: "Traditional family portraits, full documentation of mandap rituals, high-volume edited digital proofs, dedicated portrait artists.",
    quote: "Honoring heritage, celebrating legacy."
  },
  '07': {
    description: "A state-of-the-art interactive 360-degree slow-motion video setup that serves as the ultimate high-end entertainment and keepsake for your guests during the sangeet and reception.",
    inclusions: "Unlimited 360 slow-mo captures, instant QR code downloads for guests, custom luxury studio backdrop, dedicated booth director.",
    quote: "Interactive artistry in full circle."
  }
};

const HomePage = ({ onNavigate, onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [showLocations, setShowLocations] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    onNavigate('login');
  };

  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.home);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { services, gallery, siteContent, youtubeSlides, portfolioVideos } = data || {};

  // Auto-rotate Hero Slides every 6 seconds
  useEffect(() => {
    if (!youtubeSlides || youtubeSlides.length === 0) return;
    const interval = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % youtubeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [youtubeSlides]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHomeData());
    }
  }, [status, dispatch]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="home-page" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="title-serif gold-text">Loading Elite Experience...</h2>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="home-page" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p className="error-text">Failed to load content: {error}</p>
      </div>
    );
  }

  // Once loaded, access the dynamic content

  // Count total quantity of items in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}>Portfolio</a>
          <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); const el = document.getElementById('services'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); }}>Store</a>
          <a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
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
          <a href="#services" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); const el = document.getElementById('services'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); setMobileMenuOpen(false); }}>Store</a>
          <a href="#contact" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
          {isAuthenticated && (
            <a href="#" className="mobile-nav-link" style={{ color: '#ff6b6b', marginTop: '1rem' }} onClick={(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }}>Sign Out</a>
          )}
        </div>
      </div>

      {/* Dynamic YouTube Video Background Hero Section */}
      <section className="hero-section-home" style={{ overflow: 'hidden', position: 'relative' }}>
        {youtubeSlides && youtubeSlides.length > 0 ? (
          <div className="hero-video-container">
            <iframe
              src={`${youtubeSlides[activeHero % youtubeSlides.length].url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeSlides[activeHero % youtubeSlides.length].url.split('/').pop()}&rel=0`}
              title={youtubeSlides[activeHero % youtubeSlides.length].title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
            <div className="hero-video-overlay"></div>
          </div>
        ) : null}

        <div className="hero-content-home" style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="hero-title-home" style={{ transition: 'opacity 0.5s', fontSize: '5rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            {heroSlides[activeHero % heroSlides.length].title}
          </h1>
          <p className="hero-subtitle-home" style={{ letterSpacing: '2px', textShadow: '0 2px 5px rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            {heroSlides[activeHero % heroSlides.length].subtitle}
          </p>
        </div>

        <div className="hero-pagination" style={{ position: 'absolute', bottom: '3rem', zIndex: 2 }}>
          {youtubeSlides && youtubeSlides.map((_, index) => (
            <div 
              key={index}
              className={`pagination-line ${activeHero === index ? 'active' : ''}`}
              onClick={() => setActiveHero(index)}
              style={{ cursor: 'pointer' }}
            ></div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <span className="section-kicker">{siteContent.services_kicker}</span>
          <h2 className="section-title">{siteContent.services_title}</h2>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <a
              href="#"
              key={service.id}
              className="service-card"
              style={{ backgroundImage: `url(${service.img})` }}
              onClick={(e) => {
                e.preventDefault();
                const details = serviceDetails[service.id] || {};
                setSelectedService({
                  ...service,
                  ...details
                });
              }}
            >
              <div className="service-content">
                <span className="service-number">{service.id}</span>
                <h3 className="service-name">{service.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Dynamic YouTube Video Portfolio Highlights Section */}
      <section id="portfolio" className="gallery-section" style={{ padding: '6rem 4rem 6rem' }}>
        <div className="gallery-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div className="gallery-header-left" style={{ maxWidth: '50%' }}>
            <div className="section-header" style={{ textAlign: 'left', paddingTop: 0, marginBottom: '1rem' }}>
              <span className="section-kicker">Visual Narratives</span>
              <h2 className="section-title">Portfolio Highlights</h2>
            </div>
            <p className="gallery-desc" style={{ color: 'var(--lumina-gray)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Every frame is a perfect memory, every shot a masterpiece of storytelling. Explore highlights of our cinematic work.
            </p>
          </div>
          <div className="gallery-header-right">
            <button className="btn-outline" onClick={() => onNavigate('portfolio')}>VIEW FULL PORTFOLIO</button>
          </div>
        </div>

        <div className="portfolio-video-grid" style={{ marginTop: '2rem' }}>
          {portfolioVideos && portfolioVideos.slice(0, 3).map((video) => (
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
              <div className="video-info" style={{ padding: '1.25rem' }}>
                <h4>
                  {video.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Testimonial Section */}
      <section id="about" className="testimonial-section">
        <div className="quote-icon">"</div>
        <p className="testimonial-text" style={{ minHeight: '120px', transition: 'opacity 0.3s' }}>
          {testimonials[activeTestimonial].quote}
        </p>
        <div className="testimonial-author">{testimonials[activeTestimonial].author}</div>
        <div className="testimonial-location">{testimonials[activeTestimonial].location}</div>

        <div className="testimonial-nav">
          <button 
            className="nav-arrow"
            onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button 
            className="nav-arrow"
            onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
            aria-label="Next testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="home-footer">
        <div className="footer-logo-large" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <img src={logoImg} alt="SD Photography" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>

        <div className="footer-links-row">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLocations(!showLocations); }}>Locations</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Terms</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Privacy</a>
        </div>
        
        {showLocations && (
          <div className="locations-dropdown" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(195, 161, 104, 0.2)',
            borderRadius: '6px',
            padding: '1.25rem 1.5rem',
            maxWidth: '380px',
            margin: '1.5rem auto 1.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h4 style={{ color: '#c3a168', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: 0 }}>Our Studio Address</h4>
            <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
              9G2F+V27, Bypass Rd, MP Peta, Tuni, Annavaram Suravaram, Andhra Pradesh 533401
            </p>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=9G2F%2BV27%20Bypass%20Rd%20MP%20Peta%20Tuni%20Andhra%20Pradesh%20533401" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#c3a168', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Get Directions ↗
            </a>
          </div>
        )}

        <div className="social-icons">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"></path></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
        </div>

        <div className="footer-contact-info">
          {siteContent.contact_email && (
            <a href={`mailto:${siteContent.contact_email}`} className="footer-contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {siteContent.contact_email}
            </a>
          )}
          {siteContent.contact_phone && (
            <a href={`tel:${siteContent.contact_phone}`} className="footer-contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {siteContent.contact_phone}
            </a>
          )}
        </div>

        <div className="footer-copyright">
          © 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING.
        </div>
      </footer>

      {/* Service Detail Modal */}
      <div 
        className={`service-modal-overlay ${selectedService ? 'open' : ''}`}
        onClick={() => setSelectedService(null)}
      >
        {selectedService && (
          <div className="service-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="service-modal-close-btn" onClick={() => setSelectedService(null)} aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={selectedService.img} alt={selectedService.title} className="service-modal-img" />
            <div className="service-modal-body">
              <div className="service-modal-header">
                <span className="service-modal-num">Service {selectedService.id}</span>
                <h3 className="service-modal-title">{selectedService.title}</h3>
              </div>
              <p className="service-modal-desc">{selectedService.description}</p>
              <div className="service-modal-quote">"{selectedService.quote}"</div>
              <div className="service-modal-inclusions">
                <span className="inclusions-title">Luxury Inclusions & Deliverables</span>
                <p className="inclusions-text">{selectedService.inclusions}</p>
              </div>
              <button 
                className="btn-service-inquire"
                onClick={() => {
                  setSelectedService(null);
                  onNavigate('login');
                }}
              >
                INQUIRE FOR BOOKING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
