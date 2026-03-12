// client/src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Corrected import without braces
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BsPersonFill } from 'react-icons/bs'; 
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

// Import notification count utility
import { getCount, onCountChange, setCount } from '../utils/notificationCount';

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('token');

  // Initialize notification count state from utility
  const [notificationCount, setNotificationCountState] = useState(getCount());

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  let user = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      user = decoded.user;  // Assumes token structure with user key
    } catch (e) {
      console.error("Invalid token in header", e);
    }
  }

  // Subscribe to notification count changes
  useEffect(() => {
    if (!token) return;

    const unsubscribe = onCountChange(setNotificationCountState);

    // Initial fetch of notification count and update utility + state
    const fetchCount = async () => {
      try {
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('/api/notifications/count', config);
        setCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch notification count", err);
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 30000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          Versoek Carpool
        </Link>

        <div className="hamburger-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>

        <nav className={isMobileMenuOpen ? "main-nav mobile-nav-open" : "main-nav"}>
          {user ? (
            <>
              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.admin')}
                </Link>
              )}
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.calendar')}
              </Link>
              <Link to="/profile" className="icon-link profile-icon" title={t('nav.profile')} onClick={() => setMobileMenuOpen(false)}>
                <BsPersonFill size={26} />
                <span className="mobile-nav-text">{t('nav.profile')}</span>
              </Link>
              <Link to="/notifications" className="notification-bell icon-link" title={t('nav.notifications')} onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                <span className="mobile-nav-text">{t('nav.notifications')}</span>
              </Link>
              
              {/* Language Switcher - Desktop */}
              <div className="language-switcher desktop-only">
                <button 
                  onClick={() => changeLanguage('en')}
                  className={i18n.resolvedLanguage === 'en' ? 'lang-btn active' : 'lang-btn'}
                  title="English"
                >
                  EN
                </button>
                <button 
                  onClick={() => changeLanguage('nl')}
                  className={i18n.resolvedLanguage === 'nl' ? 'lang-btn active' : 'lang-btn'}
                  title="Nederlands"
                >
                  NL
                </button>
              </div>

              <button onClick={handleLogout} className="logout-button">
                {t('nav.logout')}
              </button>

              {/* Language Switcher - Mobile */}
              <div className="language-switcher mobile-only">
                <button 
                  onClick={() => {
                    changeLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={i18n.resolvedLanguage === 'en' ? 'lang-btn active' : 'lang-btn'}
                >
                  English
                </button>
                <button 
                  onClick={() => {
                    changeLanguage('nl');
                    setMobileMenuOpen(false);
                  }}
                  className={i18n.resolvedLanguage === 'nl' ? 'lang-btn active' : 'lang-btn'}
                >
                  Nederlands
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.register')}
              </Link>
              
              {/* Language Switcher for non-logged-in users - Desktop */}
              <div className="language-switcher desktop-only">
                <button 
                  onClick={() => changeLanguage('en')}
                  className={i18n.resolvedLanguage === 'en' ? 'lang-btn active' : 'lang-btn'}
                  title="English"
                >
                  EN
                </button>
                <button 
                  onClick={() => changeLanguage('nl')}
                  className={i18n.resolvedLanguage === 'nl' ? 'lang-btn active' : 'lang-btn'}
                  title="Nederlands"
                >
                  NL
                </button>
              </div>

              {/* Language Switcher for non-logged-in users - Mobile */}
              <div className="language-switcher mobile-only">
                <button 
                  onClick={() => {
                    changeLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={i18n.resolvedLanguage === 'en' ? 'lang-btn active' : 'lang-btn'}
                >
                  English
                </button>
                <button 
                  onClick={() => {
                    changeLanguage('nl');
                    setMobileMenuOpen(false);
                  }}
                  className={i18n.resolvedLanguage === 'nl' ? 'lang-btn active' : 'lang-btn'}
                >
                  Nederlands
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
