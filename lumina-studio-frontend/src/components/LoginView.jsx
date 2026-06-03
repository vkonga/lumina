import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeData } from '../store/homeSlice';
import { loginUser, registerUser, clearAuthError } from '../store/authSlice';
import { resetPassword } from '../api/auth.api';
import logoImg from '../assets/logo.png';
import './LoginView.css';

const LoginView = ({ onNavigate, initialSignUp }) => {
    const [isSignUp, setIsSignUp] = useState(initialSignUp || false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [showLocations, setShowLocations] = useState(false);

    // Forgot Password state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [fpEmail, setFpEmail] = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpConfirmPassword, setFpConfirmPassword] = useState('');
    const [fpLoading, setFpLoading] = useState(false);
    const [fpError, setFpError] = useState('');
    const [fpSuccess, setFpSuccess] = useState('');

    const dispatch = useDispatch();
    const { data: homeData, status: homeStatus } = useSelector((state) => state.home);
    const { isAuthenticated, loading, error: authError } = useSelector((state) => state.auth);

    useEffect(() => {
        if (homeStatus === 'idle') {
            dispatch(fetchHomeData());
        }
    }, [homeStatus, dispatch]);

    // Redirect to home page if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            onNavigate('home');
        }
    }, [isAuthenticated, onNavigate]);

    // Handle initialSignUp updates when component transitions
    useEffect(() => {
        if (initialSignUp !== undefined) {
            setIsSignUp(initialSignUp);
        }
    }, [initialSignUp]);

    // Clear errors when toggling forms
    useEffect(() => {
        dispatch(clearAuthError());
        setLocalError('');
    }, [isSignUp, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        if (isSignUp) {
            if (!username.trim()) {
                setLocalError('Username is required.');
                return;
            }
            if (password.length < 6) {
                setLocalError('Password must be at least 6 characters.');
                return;
            }
            dispatch(registerUser({ username, email, password }));
        } else {
            dispatch(loginUser({ email, password }));
        }
    };

    const openForgotModal = (e) => {
        e.preventDefault();
        setFpEmail(email); // Pre-fill with whatever user typed
        setFpNewPassword('');
        setFpConfirmPassword('');
        setFpError('');
        setFpSuccess('');
        setShowForgotModal(true);
    };

    const closeForgotModal = () => {
        setShowForgotModal(false);
        setFpError('');
        setFpSuccess('');
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setFpError('');
        setFpSuccess('');

        if (!fpEmail.trim()) { setFpError('Email is required.'); return; }
        if (fpNewPassword.length < 6) { setFpError('New password must be at least 6 characters.'); return; }
        if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match.'); return; }

        setFpLoading(true);
        try {
            const response = await resetPassword({ email: fpEmail, newPassword: fpNewPassword });
            if (response.success) {
                setFpSuccess('Password reset successfully! You can now sign in with your new password.');
                setFpNewPassword('');
                setFpConfirmPassword('');
                // Auto-close after 2.5 seconds
                setTimeout(() => closeForgotModal(), 2500);
            } else {
                setFpError(response.message || 'Failed to reset password.');
            }
        } catch (err) {
            setFpError(err.message || 'An error occurred. Please try again.');
        } finally {
            setFpLoading(false);
        }
    };

    if (!homeData || !homeData.siteContent) {
        return <div className="login-loading">Loading Experience...</div>;
    }

    const { siteContent } = homeData;

    return (
        <div className="login-container">
            <div className="login-left-panel">
                <div className="login-overlay"></div>
                <div className="login-hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', paddingBottom: '40px' }}>
                    <img src={logoImg} alt="SD Photography Logo" style={{ width: '140px', height: '140px', borderRadius: '50%', border: '2px solid #c3a168', backgroundColor: '#000', marginBottom: '28px', objectFit: 'contain', boxShadow: '0 10px 30px rgba(195,161,104,0.2)' }} />
                    <h1 className="hero-quote-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 12px 0', fontWeight: '400', textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>SD PHOTOGRAPHY</h1>
                    <p className="hero-quote-subtitle" style={{ fontSize: '0.85rem', letterSpacing: '4px', color: '#c3a168', textTransform: 'uppercase', margin: 0, fontWeight: '700', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>ELITE STUDIO ACCESS</p>
                </div>
            </div>

            <div className="login-right-panel">
                <div className="login-form-box">
                    <div className="login-header">
                        <h2 className="login-welcome">
                            {isSignUp ? 'Create Account' : siteContent.login_title}
                        </h2>
                        <span className="login-kicker">
                            {isSignUp ? 'REGISTER FOR STUDIO ACCESS' : siteContent.login_subtitle}
                        </span>
                    </div>

                    {(localError || authError) && (
                        <div className="auth-error-banner" style={{
                            backgroundColor: 'rgba(217, 83, 79, 0.1)',
                            borderLeft: '3px solid #d9534f',
                            color: '#f9d6d5',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            fontSize: '0.85rem',
                            borderRadius: '4px',
                            lineHeight: '1.4',
                            letterSpacing: '0.5px'
                        }}>
                            {localError || authError}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="yourname"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@sd.photography"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label>Password</label>
                                {!isSignUp && (
                                    <a href="#" className="forgot-pass" onClick={openForgotModal}>
                                        Forgot Password?
                                    </a>
                                )}
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-signin" disabled={loading}>
                            {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>{isSignUp ? 'ALREADY A MEMBER?' : 'OR JOIN THE STUDIO'}</span>
                    </div>

                    <button
                        className="btn-create-account"
                        onClick={() => setIsSignUp(!isSignUp)}
                        disabled={loading}
                    >
                        {isSignUp ? 'SIGN IN TO YOUR ACCOUNT' : 'CREATE ACCOUNT'}
                    </button>

                    <div className="social-icons" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                      <a href="https://www.instagram.com/sd_photography_durga?igsh=YTM5Z3BlNGJoM3li" target="_blank" rel="noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                      <a href="https://www.youtube.com/@sdphotographytuni7234" target="_blank" rel="noreferrer" title="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                      </a>
                      <a href="https://wa.me/919666296956" target="_blank" rel="noreferrer" title="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                          <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                        </svg>
                      </a>
                    </div>

                    <footer className="login-footer" style={{ marginBottom: showLocations ? '0.75rem' : '0' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowLocations(!showLocations); }}>LOCATIONS</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>TERMS</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>PRIVACY</a>
                    </footer>

                    {showLocations && (
                      <div className="locations-dropdown" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(195, 161, 104, 0.2)',
                        borderRadius: '6px',
                        padding: '1.25rem 1.5rem',
                        maxWidth: '320px',
                        margin: '1rem auto 0',
                        textAlign: 'center',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        animation: 'fadeIn 0.3s ease-out'
                      }}>
                        <h4 style={{ color: '#c3a168', fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: 0 }}>Our Studio Address</h4>
                        <p style={{ color: '#ccc', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
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
                          style={{ color: '#c3a168', fontSize: '0.7rem', fontWeight: '600', textDecoration: 'none', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Get Directions ↗
                        </a>
                      </div>
                    )}
                </div>
            </div>

            {/* ── Forgot Password Modal ─────────────────────────────────────── */}
            {showForgotModal && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) closeForgotModal(); }}
                >
                    <div style={{
                        background: 'linear-gradient(145deg, #111 0%, #1a1a1a 100%)',
                        border: '1px solid rgba(195,161,104,0.25)',
                        borderRadius: '8px',
                        padding: '40px 36px',
                        width: '100%',
                        maxWidth: '420px',
                        position: 'relative'
                    }}>
                        {/* Close button */}
                        <button
                            onClick={closeForgotModal}
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1,
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.color = '#c3a168'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        >
                            ✕
                        </button>

                        <h3 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '1.8rem', color: '#c3a168',
                            marginBottom: '6px', letterSpacing: '1px'
                        }}>
                            Reset Password
                        </h3>
                        <p style={{
                            fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)',
                            letterSpacing: '2px', textTransform: 'uppercase',
                            marginBottom: '28px'
                        }}>
                            Enter your email and set a new password
                        </p>

                        {fpError && (
                            <div style={{
                                background: 'rgba(217,83,79,0.1)', borderLeft: '3px solid #d9534f',
                                color: '#f9d6d5', padding: '10px 14px', borderRadius: '4px',
                                fontSize: '0.83rem', marginBottom: '20px', letterSpacing: '0.3px'
                            }}>
                                {fpError}
                            </div>
                        )}
                        {fpSuccess && (
                            <div style={{
                                background: 'rgba(46,160,67,0.1)', borderLeft: '3px solid #2ea043',
                                color: '#9ecf88', padding: '10px 14px', borderRadius: '4px',
                                fontSize: '0.83rem', marginBottom: '20px', letterSpacing: '0.3px'
                            }}>
                                {fpSuccess}
                            </div>
                        )}

                        <form onSubmit={handleForgotSubmit}>
                            {[
                                { label: 'Email Address', value: fpEmail, setter: setFpEmail, type: 'email', placeholder: 'your@email.com' },
                                { label: 'New Password', value: fpNewPassword, setter: setFpNewPassword, type: 'password', placeholder: '••••••••' },
                                { label: 'Confirm New Password', value: fpConfirmPassword, setter: setFpConfirmPassword, type: 'password', placeholder: '••••••••' },
                            ].map(({ label, value, setter, type, placeholder }) => (
                                <div key={label} style={{ marginBottom: '18px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '0.72rem',
                                        letterSpacing: '2px', textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.55)', marginBottom: '8px'
                                    }}>
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        value={value}
                                        onChange={e => setter(e.target.value)}
                                        placeholder={placeholder}
                                        disabled={fpLoading}
                                        required
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(195,161,104,0.25)',
                                            borderRadius: '4px', padding: '12px 14px',
                                            color: '#fff', fontSize: '0.9rem',
                                            fontFamily: 'inherit', outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(195,161,104,0.7)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(195,161,104,0.25)'}
                                    />
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={fpLoading}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: fpLoading
                                        ? 'rgba(195,161,104,0.3)'
                                        : 'linear-gradient(135deg, #c3a168, #a0824d)',
                                    border: 'none', borderRadius: '4px',
                                    color: '#fff', fontSize: '0.8rem',
                                    letterSpacing: '3px', textTransform: 'uppercase',
                                    fontFamily: 'inherit', cursor: fpLoading ? 'not-allowed' : 'pointer',
                                    transition: 'opacity 0.2s',
                                    marginTop: '8px'
                                }}
                            >
                                {fpLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginView;
