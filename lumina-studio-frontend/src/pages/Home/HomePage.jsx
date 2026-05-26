import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData, selectHomeData, selectHomeStatus, selectHomeError } from '../../redux/slices/homeSlice';
import Loader from '../../components/ui/Loader';
import { MENU_ITEMS, FOOTER_LINKS, BUTTON_LABELS, BRAND } from '../../utils/utility';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '../../constants/messages.constants';
import './HomePage.css';

const HomePage = ({ onNavigate }) => {
    const dispatch = useDispatch();
    const data = useSelector(selectHomeData);
    const status = useSelector(selectHomeStatus);
    const error = useSelector(selectHomeError);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchHomeData());
    }, [status, dispatch]);

    if (status === 'loading' || status === 'idle') {
        return <Loader fullPage message={LOADING_MESSAGES.HOME} />;
    }

    if (status === 'failed') {
        return (
            <div className="home-page home-page--error">
                <p className="text-error">{ERROR_MESSAGES.LOAD_HOME_FAILED}</p>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
            </div>
        );
    }

    const { hero, services, gallery, testimonial, siteContent } = data;

    return (
        <div className="home-page">
            {/* ── Navbar ── */}
            <nav className="navbar">
                <div className="logo-serif" style={{ cursor: 'pointer' }} onClick={() => onNavigate('home')}>
                    {BRAND.NAME}
                </div>
                <div className="nav-links">
                    {MENU_ITEMS.filter(m => ['portfolio', 'services', 'store', 'about', 'contact'].includes(m.key)).map(item => (
                        <a
                            key={item.key}
                            href={item.path === 'store' ? '#' : item.path}
                            className="nav-link"
                            onClick={item.path === 'store' ? (e) => { e.preventDefault(); onNavigate('store'); } : undefined}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
                <div className="nav-actions">
                    <button className="btn-outline" onClick={() => onNavigate('login')}>{BUTTON_LABELS.BOOK_US}</button>
                    <svg className="bag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={() => onNavigate('store')}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="hero-section-home" style={{ backgroundImage: `url(${hero.image})` }}>
                <div className="hero-content-home">
                    <h1 className="hero-title-home">{hero.title}</h1>
                    <p className="hero-subtitle-home">{hero.subtitle}</p>
                </div>
                <div className="hero-pagination">
                    <div className="pagination-line active" />
                    <div className="pagination-line" />
                    <div className="pagination-line" />
                </div>
            </section>

            {/* ── Services ── */}
            <section className="services-section">
                <div className="section-header">
                    <span className="section-kicker">{siteContent.services_kicker}</span>
                    <h2 className="section-title">{siteContent.services_title}</h2>
                </div>
                <div className="services-grid">
                    {services.map((service) => (
                        <a key={service.id} href="#" className="service-card" style={{ backgroundImage: `url(${service.img})` }}>
                            <div className="service-content">
                                <span className="service-number">{service.id}</span>
                                <h3 className="service-name">{service.title}</h3>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* ── Gallery ── */}
            <section className="gallery-section">
                <div className="gallery-header-row">
                    <div className="gallery-header-left">
                        <div className="section-header">
                            <span className="section-kicker">{siteContent.gallery_kicker}</span>
                            <h2 className="section-title">{siteContent.gallery_title}</h2>
                        </div>
                        <p className="gallery-desc">{siteContent.gallery_description}</p>
                    </div>
                    <div className="gallery-header-right">
                        <button className="btn-outline">{BUTTON_LABELS.VIEW_FULL_PORTFOLIO}</button>
                    </div>
                </div>
                <div className="gallery-grid">
                    {gallery.map((img, index) => (
                        <div key={index} className="gallery-item" style={{ backgroundImage: `url(${img})` }} />
                    ))}
                </div>
            </section>

            {/* ── Testimonial ── */}
            <section className="testimonial-section">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonial.quote}</p>
                <div className="testimonial-author">{testimonial.author}</div>
                <div className="testimonial-location">{testimonial.location}</div>
                <div className="testimonial-nav">
                    <button className="nav-arrow" aria-label="Previous">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className="nav-arrow" aria-label="Next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="home-footer">
                <div className="footer-logo-large">{BRAND.SHORT}</div>
                <div className="footer-links-row">
                    {FOOTER_LINKS.map(link => (
                        <a key={link.key} href={link.path}>{link.label}</a>
                    ))}
                </div>
                <div className="social-icons">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
                </div>
                <div className="footer-copyright">{BRAND.COPYRIGHT}</div>
            </footer>
        </div>
    );
};

export default HomePage;
