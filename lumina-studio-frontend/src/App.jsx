import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './components/HomePage';
import StoreView from './components/StoreView';
import LoginView from './components/LoginView';
import PortfolioView from './components/PortfolioView';
import CartDrawer from './components/CartDrawer';
import { initializeAuth, logout } from './store/authSlice';
import { fetchCart, resetCart } from './store/cartSlice';
import { getMe } from './api/auth.api';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);

  // Initialize Auth on reload
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // After auth is initialized, validate the token against the DB.
  // If the user no longer exists (e.g. after a DB re-seed), force logout.
  useEffect(() => {
    const token = localStorage.getItem('lumina_auth_token');
    if (!token) return;

    getMe().then((res) => {
      if (!res.success) {
        // Token is valid JWT but user doesn't exist in DB → force logout
        localStorage.removeItem('lumina_auth_token');
        dispatch(logout());
        dispatch(resetCart());
        setCurrentView('login');
      }
    }).catch(() => {
      // 401 or network error → clear stale session
      localStorage.removeItem('lumina_auth_token');
      dispatch(logout());
      dispatch(resetCart());
      setCurrentView('login');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Fetch cart data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const [scrollTarget, setScrollTarget] = useState(null);

  const handleNavigate = (view, target = null) => {
    setCurrentView(view);
    setScrollTarget(target);
  };

  // Handle session expiry events (fired by ResponseInterceptor on 401)
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logout());
      dispatch(resetCart());
      setCartOpen(false);
      handleNavigate('login');
    };
    window.addEventListener('lumina:session-expired', handleSessionExpired);
    return () => window.removeEventListener('lumina:session-expired', handleSessionExpired);
  }, [dispatch]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} scrollTarget={scrollTarget} setScrollTarget={setScrollTarget} onOpenCart={() => setCartOpen(true)} />;
      case 'store':
        return <StoreView onNavigate={handleNavigate} onOpenCart={() => setCartOpen(true)} />;
      case 'portfolio':
        return <PortfolioView onNavigate={handleNavigate} onOpenCart={() => setCartOpen(true)} />;
      case 'login':
        return <LoginView onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsView onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyView onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} scrollTarget={scrollTarget} setScrollTarget={setScrollTarget} onOpenCart={() => setCartOpen(true)} />;
    }
  };

  return (
    <>
      {renderView()}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default App;
