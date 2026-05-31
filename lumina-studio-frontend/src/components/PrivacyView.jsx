import React from 'react';
import './PrivacyView.css';
import logoImg from '../assets/logo.png';

const PrivacyView = ({ onNavigate }) => {
  return (
    <div className="privacy-page-view">
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
          <span className="legal-kicker">Legal & Compliance</span>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last Updated: May 31, 2026 | Effective Date: May 31, 2026</p>
        </header>

        <section className="legal-card">
          <div className="legal-section">
            <h2>1. Introduction & Scope</h2>
            <p>
              Welcome to <strong>SD Photography</strong>. We are committed to protecting your privacy and personal data. This Privacy Policy outlines how we collect, process, share, and protect your personal information when you visit our website, book our luxury photography services, or purchase products from our e-commerce boutique.
            </p>
            <p>
              This Privacy Policy is compiled in strict compliance with the **Digital Personal Data Protection Act, 2023 (DPDPA 2023)**, **Section 43A of the Information Technology Act, 2000**, and the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)** of India.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>
              Under DPDPA and SPDI rules, we only collect personal information that is necessary for lawful processing, contract performance, or providing your customized boutique products:
            </p>
            <ul>
              <li><strong>Identity Information:</strong> Full name, username, and authentication details when creating an account.</li>
              <li><strong>Contact Information:</strong> Email address, delivery phone number, billing address, and street shipping address.</li>
              <li><strong>Sensitive Personal Data (SPDI):</strong> Encrypted passwords and payment details. <em>Note: Online transactions are securely processed via Razorpay, and we do not store raw card numbers or credit credentials on our servers.</em></li>
              <li><strong>Uploaded Customer Assets:</strong> Raw photographs and custom snapshots uploaded by you in the Boutique Store for printed framing and memorabilia customization.</li>
              <li><strong>Usage Data:</strong> Device metrics, browser history, cookie settings, and session status triggers.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Purpose and Legal Basis of Processing</h2>
            <p>
              We process your personal data under the lawful grounds of **Consent** and **Contractual Necessity** (Section 6, DPDPA 2023) for the following explicit purposes:
            </p>
            <ul>
              <li>Fulfilling and tracking boutique sales and custom frame orders.</li>
              <li>Scheduling, managing, and confirming photography and videography bookings.</li>
              <li>Verifying payment ledger signatures in coordination with our payment gateway (Razorpay).</li>
              <li>Answering user inquiries, sharing newsletters, and notifying you about custom print proofs.</li>
              <li>Complying with statutory audits, Indian tax filings (GST), and standard administrative obligations.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Consent Management & Your Rights</h2>
            <p>
              Under the **Digital Personal Data Protection Act, 2023**, you are a "Data Principal" and hold absolute rights over your data:
            </p>
            <ul>
              <li><strong>Right to Access & Review:</strong> You can request a summary of the personal information we process.</li>
              <li><strong>Right to Correction & Erasure:</strong> You can request correction of inaccurate data or permanent deletion of your account and uploaded photos, except where statutory retention is required.</li>
              <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw your consent to data processing at any point by emailing our Grievance Officer.</li>
              <li><strong>Right to Grievance Redressal:</strong> You may register disputes or queries regarding personal data processing with our dedicated officer.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Data Retention & Security Protocols</h2>
            <p>
              We employ reasonable security practices and procedures (Section 8, DPDPA & ISO 27001 equivalents) to safeguard your personal data from unauthorized access, breach, or disclosure. Uploaded custom images for printed boutique collections are encrypted and stored in private storage nodes, and deleted 30 days after order delivery confirmation.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. Statutory Grievance Redressal Officer</h2>
            <p>
              As required by the **Information Technology Rules, 2011** and the **DPDPA 2023**, the name and contact details of our Grievance Officer are published below. Please direct all queries, requests for data deletion, or compliance concerns to:
            </p>
            <div className="grievance-card">
              <h3>Designated Grievance & Compliance Officer</h3>
              <p><strong>Officer Name:</strong> Sridhar</p>
              <p><strong>Company:</strong> SD Photography</p>
              <p><strong>Email Address:</strong> <a href="mailto:sridurgastudio1@gmail.com">sridurgastudio1@gmail.com</a></p>
              <p><strong>Mobile Hotline:</strong> <a href="tel:+919666296956">+91 9666296956</a></p>
              <p><strong>Jurisdiction:</strong> Andhra Pradesh & Telangana, India</p>
            </div>
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

export default PrivacyView;
