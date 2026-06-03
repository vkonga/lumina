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
    quote: "Their cinematography and maternity captures allowed our families across the globe to feel every intimate emotion. Exquisite service and quality.",
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
    description: "Capturing the beautiful, glowing journey of motherhood with cinematic elegance and delicate grace. Timeless portraits celebrating new life in a luxurious fine-art environment.",
    inclusions: "Bespoke studio/outdoor session, luxury pregnancy gowns wardrobe, fine-art digital gallery, 20 high-end masterfully retouched archival prints.",
    quote: "Celebrating the sacred miracle of motherhood."
  },
  '04': {
    description: "A breathtaking cinematic shoot set in iconic heritage palaces, tranquil lakes, or sand dunes. Designed to capture your chemistry and tell your romantic prelude story before the grand festivities begin.",
    inclusions: "Premium 4K pre-wedding teaser film, 50 masterfully edited portraits, custom wardrobe consulting, lifestyle venue styling.",
    quote: "The elegant prelude to your forever."
  },
  '05': {
    description: "Preserving the whimsical charm, spontaneous laughter, and innocent glances of your little ones. Custom-themed interactive studio sessions that make memories last forever.",
    inclusions: "Creative thematic backdrops, interactive child-friendly team, dynamic digital proofs showcase, custom heirloom keepsake album.",
    quote: "Capturing childhood's pure, fleeting magic."
  },
  '06': {
    description: "Documenting every sacred custom, ritual, and family portrait with strict adherence to authentic traditional framing. Ideal for haldi, mehndi, sangeet, and grand reception group portraits.",
    inclusions: "Traditional family portraits, full documentation of mandap rituals, high-volume edited digital proofs, dedicated portrait artists.",
    quote: "Honoring heritage, celebrating legacy."
  },
  '07': {
    description: "High-end editorial fashion photography featuring ultra-modern creative lighting, avant-garde framing, and professional portfolio-level art direction.",
    inclusions: "Studio/on-location shoot, multi-look creative styling, professional model portfolio lookbook, masterfully color-graded high-res digital frames.",
    quote: "Transforming vision into high-fashion art."
  }
};

const HomePage = ({ onNavigate, onOpenCart, scrollTarget, setScrollTarget }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [showLocations, setShowLocations] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [newReviewQuote, setNewReviewQuote] = useState('');
  const [newReviewLocation, setNewReviewLocation] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    onNavigate('login');
  };

  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.home);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { services, gallery, siteContent, youtubeSlides, portfolioVideos, testimonial } = data || {};

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!newReviewQuote.trim()) {
      setReviewError('Review content cannot be empty.');
      return;
    }

    setReviewLoading(true);
    try {
      const token = localStorage.getItem('lumina_auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/home/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quote: newReviewQuote.trim(),
          location: newReviewLocation.trim() || 'TUNI, ANDHRA PRADESH'
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit review');
      }

      setReviewSuccess('Thank you! Your premium review has been posted successfully.');
      setNewReviewQuote('');
      setNewReviewLocation('');
      dispatch(fetchHomeData()); // Reload dynamic DB testimonials
      
      // Auto close modal after 2 seconds
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess('');
      }, 2000);
    } catch (err) {
      setReviewError(err.message || 'An error occurred during submission.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle auto-scrolling to target sections (e.g. Services / Contact)
  useEffect(() => {
    if (scrollTarget) {
      const el = document.getElementById(scrollTarget);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      setScrollTarget(null);
    }
  }, [scrollTarget, setScrollTarget]);

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

  // Check and show active offer popup (once per session)
  useEffect(() => {
    if (status === 'succeeded' && data?.offers && data.offers.length > 0) {
      const dismissed = sessionStorage.getItem('lumina_offer_dismissed');
      if (!dismissed) {
        // Select the first active offer
        const activeOffer = data.offers.find(o => o.is_active !== false);
        if (activeOffer) {
          setCurrentOffer(activeOffer);
          // Wait 1.5 seconds after landing for elegant entry animation
          const timer = setTimeout(() => {
            setShowOfferPopup(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [status, data]);

  const handleCloseOffer = () => {
    setShowOfferPopup(false);
    sessionStorage.setItem('lumina_offer_dismissed', 'true');
  };

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

  const dbTestimonials = testimonial || [];
  const combinedTestimonials = [...dbTestimonials];
  testimonials.forEach(item => {
    if (!combinedTestimonials.some(t => t.quote === item.quote || (t.author === item.author && t.location === item.location))) {
      combinedTestimonials.push(item);
    }
  });

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}>Portfolio</a>
          <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); const el = document.getElementById('services'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); }}>Store</a>
          <a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
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
          <a href="#services" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); const el = document.getElementById('services'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
          <a href="#" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); setMobileMenuOpen(false); }}>Store</a>
          <a href="#contact" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
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
          {combinedTestimonials[activeTestimonial % combinedTestimonials.length]?.quote}
        </p>
        <div className="testimonial-author">{combinedTestimonials[activeTestimonial % combinedTestimonials.length]?.author}</div>
        <div className="testimonial-location">{combinedTestimonials[activeTestimonial % combinedTestimonials.length]?.location}</div>

        <div className="testimonial-nav">
          <button 
            className="nav-arrow"
            onClick={() => setActiveTestimonial((prev) => (prev - 1 + combinedTestimonials.length) % combinedTestimonials.length)}
            aria-label="Previous testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button 
            className="nav-arrow"
            onClick={() => setActiveTestimonial((prev) => (prev + 1) % combinedTestimonials.length)}
            aria-label="Next testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {isAuthenticated ? (
          <button className="btn-outline review-btn" style={{ marginTop: '2.5rem' }} onClick={() => setShowReviewModal(true)}>
            LEAVE A REVIEW
          </button>
        ) : (
          <button className="btn-outline review-btn" style={{ marginTop: '2.5rem' }} onClick={() => onNavigate('login')}>
            SIGN IN TO LEAVE A REVIEW
          </button>
        )}
      </section>

      {/* Footer */}
      <footer id="contact" className="home-footer">
        <div className="footer-logo-large" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => onNavigate('home')}>
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
        <div className="social-icons">
          <a href="https://www.instagram.com/sd_photography_durga?igsh=YTM5Z3BlNGJoM3li" target="_blank" rel="noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.youtube.com/@sdphotographytuni7234" target="_blank" rel="noreferrer" title="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </a>
          {siteContent.contact_phone && (
            <a href={`https://wa.me/91${siteContent.contact_phone}`} target="_blank" rel="noreferrer" title="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
            </a>
          )}
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

              {/* Reference Images Gallery Showcase */}
              {selectedService.reference_images && selectedService.reference_images.split(',').map(x => x.trim()).filter(Boolean).length > 0 && (
                <div className="service-modal-reference-gallery">
                  <span className="reference-gallery-title">Reference Showcase</span>
                  <div className="reference-gallery-grid">
                    {selectedService.reference_images.split(',').map(x => x.trim()).filter(Boolean).map((imgUrl, i) => (
                      <div key={i} className="reference-gallery-item" onClick={() => setLightboxImg(imgUrl)}>
                        <img src={imgUrl} alt={`${selectedService.title} Reference ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="lightbox-modal-overlay open" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close-btn" onClick={() => setLightboxImg(null)} aria-label="Close image showcase">
            &times;
          </button>
          <img src={lightboxImg} alt="Reference Full View" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      {/* Review Submission Modal */}
      {showReviewModal && (
        <div 
          className="service-modal-overlay open"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="service-modal-box review-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="service-modal-close-btn" onClick={() => setShowReviewModal(false)} aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="service-modal-body" style={{ padding: '36px' }}>
              <div className="service-modal-header" style={{ marginBottom: '8px' }}>
                <span className="service-modal-num">Share Your Experience</span>
                <h3 className="service-modal-title" style={{ fontSize: '2rem' }}>Write a Review</h3>
              </div>
              
              <p className="service-modal-desc" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                Signed in as <strong style={{ color: '#fff' }}>{user?.username}</strong>. Your feedback is highly appreciated and will be featured on our testimonial slider.
              </p>

              {reviewError && (
                <div style={{
                  background: 'rgba(217, 83, 79, 0.1)',
                  borderLeft: '3px solid #d9534f',
                  color: '#f9d6d5',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '0.83rem',
                  marginBottom: '16px'
                }}>
                  {reviewError}
                </div>
              )}

              {reviewSuccess && (
                <div style={{
                  background: 'rgba(46, 160, 67, 0.1)',
                  borderLeft: '3px solid #2ea043',
                  color: '#9ecf88',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '0.83rem',
                  marginBottom: '16px'
                }}>
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Your Review *
                  </label>
                  <textarea
                    placeholder="Describe your premium experience with SD Photography..."
                    value={newReviewQuote}
                    onChange={(e) => setNewReviewQuote(e.target.value)}
                    required
                    disabled={reviewLoading}
                    rows="4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(241, 213, 146, 0.2)',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'none',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Your Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TUNI, ANDHRA PRADESH"
                    value={newReviewLocation}
                    onChange={(e) => setNewReviewLocation(e.target.value)}
                    disabled={reviewLoading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(241, 213, 146, 0.2)',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="btn-service-inquire"
                  style={{
                    alignSelf: 'stretch',
                    marginTop: '8px',
                    padding: '14px',
                    textAlign: 'center',
                    background: '#f1d592',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                  }}
                >
                  {reviewLoading ? 'Submitting...' : 'POST REVIEW'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Offers Popup Modal */}
      {showOfferPopup && currentOffer && (
        <div className="offers-popup-overlay" onClick={handleCloseOffer}>
          <div className="offers-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="offers-popup-close" onClick={handleCloseOffer} aria-label="Close promotion">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {currentOffer.image_url && (
              <img src={currentOffer.image_url} alt={currentOffer.title} className="offers-popup-banner" />
            )}
            <div className="offers-popup-body">
              <span className="offers-popup-kicker">Exclusive Promotion</span>
              <h2 className="offers-popup-title">{currentOffer.title}</h2>
              <p className="offers-popup-desc">{currentOffer.description}</p>
              
              {currentOffer.discount_code && (
                <div className="offers-popup-code-box">
                  <span className="offers-popup-code-label">Use discount code</span>
                  <span className="offers-popup-code-value">{currentOffer.discount_code}</span>
                </div>
              )}
              
              <button 
                className="offers-popup-action-btn"
                onClick={() => {
                  handleCloseOffer();
                  onNavigate('store');
                }}
              >
                Go to Boutique Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
