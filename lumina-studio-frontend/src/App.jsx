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
import OrdersView from './components/OrdersView';
import MyListingsView from './components/MyListingsView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
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
        setCurrentView('home');
      }
    }).catch(() => {
      // 401 or network error → clear stale session
      localStorage.removeItem('lumina_auth_token');
      dispatch(logout());
      dispatch(resetCart());
      setCurrentView('home');
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

  // Handle popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        setScrollTarget(event.state.target);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const parts = hash.split('-');
          setCurrentView(parts[0]);
          setScrollTarget(parts[1] || null);
        } else {
          setCurrentView('home');
          setScrollTarget(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Parse initial hash if present
    const initialHash = window.location.hash.replace('#', '');
    let initialView = 'home';
    let initialTarget = null;
    if (initialHash) {
      const parts = initialHash.split('-');
      initialView = parts[0];
      initialTarget = parts[1] || null;
      setCurrentView(initialView);
      setScrollTarget(initialTarget);
    }
    window.history.replaceState({ view: initialView, target: initialTarget }, '', window.location.hash || '#home');

    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (view, target = null) => {
    setCurrentView(view);
    setScrollTarget(target);
    const currentHash = `#${view}${target ? `-${target}` : ''}`;
    if (window.location.hash !== currentHash) {
      window.history.pushState({ view, target }, '', currentHash);
    }
  };

  // Handle session expiry events (fired by ResponseInterceptor on 401)
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logout());
      dispatch(resetCart());
      setCartOpen(false);
      handleNavigate('home');
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
        return <LoginView onNavigate={handleNavigate} initialSignUp={scrollTarget === 'signup'} />;
      case 'terms':
        return <TermsView onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyView onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersView onNavigate={handleNavigate} onOpenCart={() => setCartOpen(true)} />;
      case 'listings':
        return <MyListingsView onNavigate={handleNavigate} onOpenCart={() => setCartOpen(true)} />;
      default:
        return <HomePage onNavigate={handleNavigate} scrollTarget={scrollTarget} setScrollTarget={setScrollTarget} onOpenCart={() => setCartOpen(true)} />;
    }
  };

  return (
    <>
      {renderView()}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onNavigate={handleNavigate} />
    </>
  );
}

export default App;
