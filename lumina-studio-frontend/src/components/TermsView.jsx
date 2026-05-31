import React from 'react';
import './TermsView.css';
import logoImg from '../assets/logo.png';

const TermsView = ({ onNavigate }) => {
  return (
    <div className="terms-page-view">
      {/* Navbar */}
      <nav className="navbar" style={{ position: 'relative', background: '#050505' }}>
        <div className="logo-serif" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('home')}>
          <img src={logoImg} alt="SD Photography" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('portfolio'); }}>Portfolio</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Services</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('store'); }}>Store</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Contact</a>
        </div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => onNavigate('home')}>Go Back</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="legal-container">
        <header className="legal-header">
          <span className="legal-kicker">Terms & Conditions</span>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last Updated: May 31, 2026 | Effective Date: May 31, 2026</p>
        </header>

        <section className="legal-card">
          <div className="legal-section">
            <h2>1. Contractual Relationship</h2>
            <p>
              These Terms of Service ("Terms") govern your access and use of the <strong>SD Photography</strong> digital portal, booking platform, and e-commerce boutique. By accessing the site, booking a photography/videography service, or purchasing merchandise, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p>
              These Terms constitute a legally binding electronic contract under the **Information Technology Act, 2000** and rules made thereunder, including the **Consumer Protection (E-Commerce) Rules, 2020** of India.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Copyright & Intellectual Property (Copyright Act, 1957)</h2>
            <p>
              In accordance with the **Indian Copyright Act, 1957**, all photographs, cinematic showreels, digital assets, and videographic works captured by our team are the exclusive intellectual property and copyright of <strong>SD Photography</strong>.
            </p>
            <ul>
              <li><strong>Personal Use License:</strong> Upon full clearance of payment, clients receive a non-exclusive, non-transferable license to display, copy, and print original event captures for personal, domestic, and non-commercial purposes.</li>
              <li><strong>Commercial Restrictions:</strong> No client, third-party vendor, or business may sell, license, publish, or use SD Photography's captures for commercial advertisements or promotional campaigns without our explicit written consent and a designated commercial license agreement.</li>
              <li><strong>Moral Rights:</strong> SD Photography retains moral rights under Section 57 of the Copyright Act, including the right of attribution (crediting "SD Photography" when publishing works online).</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. E-Commerce & Custom Printing (Consumer Protection Rules)</h2>
            <p>
              Our Boutique Store permits the purchase of custom items (Archival Walnut Frames, Designer Accented Mugs, Apparel). Under the **Consumer Protection (E-Commerce) Rules, 2020**:
            </p>
            <ul>
              <li><strong>Pricing and GST:</strong> All prices displayed on our website are transparent. Applicable GST and courier delivery costs are calculated at checkout.</li>
              <li><strong>Custom Fabrication Uploads:</strong> When utilizing our premium Product Customizer to upload private snapshots for print framing, you warrant that you own or hold appropriate licenses to the uploaded digital image. We reject files containing obscene, copyrighted, or unlawful material.</li>
              <li><strong>No-Cancellation for Custom Items:</strong> Once the production, print framing, or engraving of custom uploaded orders commences, cancellations or refunds cannot be processed, except in cases where a delivery reaches you in a physically damaged or structurally defective condition.</li>
              <li><strong>Return Policy:</strong> Damaged or structurally defective items must be reported to our Grievance email within **48 hours** of package receipt along with unboxing video proofs to qualify for free replacements.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Bookings, Booking Deposits & Cancellations</h2>
            <p>
              For booking photography and videography services:
            </p>
            <ul>
              <li>A non-refundable retainer/booking deposit is required to block dates on our calendar.</li>
              <li>Payment schedules for service packages must be cleared as specified in individual booking contracts.</li>
              <li>In the event of cancellation or postponement by the client, the deposit will be retained to offset booking exclusivity losses. Retainer adjustments for rescheduled events are at the sole discretion of the studio.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Limitation of Liability & Indemnity</h2>
            <p>
              SD Photography maintains state-of-the-art camera gear, backup recording card slots, and dual storage vaults. In the extremely unlikely event of technical camera failure, card corruption, or force majeure (natural calamities, lockdowns), our liability is strictly limited to the refund of paid booking services or a prorated amount thereof.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. Governing Law & Jurisdiction</h2>
            <p>
              These Terms, transactions, and service contracts are governed by and construed in accordance with the laws of India. Any legal actions or disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the competent courts in **Hyderabad, Telangana**, India.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer" style={{ borderTop: '1px solid rgba(195,161,104,0.1)', background: '#050505', padding: '4rem 2rem 2rem' }}>
        <div className="footer-logo-large" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <img src={logoImg} alt="SD Photography" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.2px solid #c3a168', backgroundColor: '#000', objectFit: 'contain' }} />
          <span>SD PHOTOGRAPHY</span>
        </div>
        <div className="footer-copyright" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          © 2026 SD PHOTOGRAPHY. THE ART OF VISUAL STORYTELLING. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default TermsView;
