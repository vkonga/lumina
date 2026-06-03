import React from 'react';
import logoImg from '../assets/logo.png';
import './AuthPromptModal.css';

const AuthPromptModal = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleAction = (view, target = null) => {
    onClose();
    onNavigate(view, target);
  };

  return (
    <div className="auth-prompt-overlay" onClick={onClose}>
      <div className="auth-prompt-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-prompt-logo-wrap">
          <img src={logoImg} alt="SD Photography" className="auth-prompt-logo" />
        </div>
        <h2 className="auth-prompt-title">Studio Access</h2>
        <span className="auth-prompt-kicker">Authentication Required</span>
        <p className="auth-prompt-desc">
          Please sign in or create an account to customize designs, upload prints, and proceed with purchases from our elite collections.
        </p>
        <div className="auth-prompt-actions">
          <button 
            className="auth-prompt-btn-primary" 
            onClick={() => handleAction('login')}
          >
            Sign In to Account
          </button>
          <button 
            className="auth-prompt-btn-outline" 
            onClick={() => handleAction('login', 'signup')}
          >
            Create New Account
          </button>
          <button 
            className="auth-prompt-btn-flat" 
            onClick={onClose}
          >
            Go Back & Browse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
