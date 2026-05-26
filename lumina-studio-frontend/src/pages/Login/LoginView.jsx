import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, selectAuthLoading, selectAuthError, clearAuthError } from '../../redux/slices/authSlice';
import { selectHomeData, selectHomeStatus } from '../../redux/slices/homeSlice';
import Loader from '../../components/ui/Loader';
import { BUTTON_LABELS, FORM_LABELS, BRAND } from '../../utils/utility';
import { LOADING_MESSAGES } from '../../constants/messages.constants';
import './LoginView.css';

const LoginView = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const isLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);
    const homeData = useSelector(selectHomeData);
    const homeStatus = useSelector(selectHomeStatus);

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());
        const result = await dispatch(loginThunk({ email, password }));
        if (loginThunk.fulfilled.match(result)) {
            onNavigate('home');
        }
    };

    if (homeStatus === 'loading' || homeStatus === 'idle') {
        return <Loader fullPage message={LOADING_MESSAGES.GENERIC} />;
    }

    const siteContent = homeData?.siteContent || {};

    return (
        <div className="login-container">
            {/* ── Left Panel ── */}
            <div className="login-left-panel">
                <div className="login-overlay" />
                <div className="login-hero-text">
                    <h1 className="hero-quote-title">{siteContent.login_hero_title || BRAND.TAGLINE}</h1>
                    <p className="hero-quote-subtitle">{siteContent.login_hero_subtitle || ''}</p>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="login-right-panel">
                <div className="login-form-box">
                    <div className="login-header">
                        <h2 className="login-welcome">{siteContent.login_title || 'Welcome Back'}</h2>
                        <span className="login-kicker">{siteContent.login_subtitle || 'EXCLUSIVE MEMBER ACCESS'}</span>
                    </div>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>{FORM_LABELS.EMAIL_LABEL}</label>
                            <input
                                type="email"
                                placeholder={FORM_LABELS.EMAIL_PLACEHOLDER}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label>{FORM_LABELS.PASSWORD_LABEL}</label>
                                <a href="#" className="forgot-pass">{FORM_LABELS.FORGOT_PASSWORD}</a>
                            </div>
                            <input
                                type="password"
                                placeholder={FORM_LABELS.PASSWORD_PLACEHOLDER}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {authError && (
                            <p className="login-error" role="alert">{authError}</p>
                        )}

                        <button type="submit" className="btn-signin" disabled={isLoading}>
                            {isLoading ? 'Signing in…' : BUTTON_LABELS.SIGN_IN}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>{BRAND.DIVIDER_TEXT}</span>
                    </div>

                    <button className="btn-create-account">{BUTTON_LABELS.CREATE_ACCOUNT}</button>

                    <footer className="login-footer">
                        <a href="#">LOCATIONS</a>
                        <a href="#">CAREERS</a>
                        <a href="#">TERMS</a>
                        <a href="#">PRIVACY</a>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
