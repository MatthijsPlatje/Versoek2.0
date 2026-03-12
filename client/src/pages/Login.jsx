// client/src/pages/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import './Auth.css';

const Login = () => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = '/api/auth/login';
      const response = await axios.post(apiUrl, { email, password });

      localStorage.setItem('token', response.data.token);
      navigate('/');

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || t('auth.login.error')); // UPDATED: Use translation
      } else {
        setError(t('auth.login.errorGeneric')); // UPDATED: Use translation
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{t('auth.login.title')}</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-group">
          <label>{t('auth.login.email')}:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder={t('auth.login.emailPlaceholder')}
            required
          />
        </div>
        <div className="form-group">
          <label>{t('auth.login.password')}:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder={t('auth.login.passwordPlaceholder')}
            required
          />
        </div>
        <button type="submit" className="auth-button">
          {t('auth.login.loginButton')}
        </button>
      </form>
      {error && <p className="auth-message error">{error}</p>}
      
      {/* NEW: Add register link */}
      <p className="auth-link">
        {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link>
      </p>
    </div>
  );
};

export default Login;