// client/src/pages/Contact.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6Lec8OgrAAAAAHCa8cKkCl9vwIFVf1Lufw2VvVH5';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Get reCAPTCHA v3 token
      const recaptchaToken = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute('6Lec8OgrAAAAAHCa8cKkCl9vwIFVf1Lufw2VvVH5', { action: 'contact' })
            .then(resolve)
            .catch(reject);
        });
      });

      await axios.post('/api/contact', {
        ...formData,
        recaptchaToken
      });

      setStatus({ 
        type: 'success', 
        message: t('contact.form.successMessage') 
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || t('contact.form.errorMessage') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '15px'
          }}>
            {t('contact.hero.title')}
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.95' }}>
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            
            {/* Contact Information */}
            <div style={{ padding: '30px' }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '30px',
                color: '#2c3e50'
              }}>
                {t('contact.info.title')}
              </h2>
              
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>📧</span>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                      {t('contact.info.email.title')}
                    </h3>
                    <a href="mailto:info@versoek.nl" style={{ 
                      color: '#667eea', 
                      textDecoration: 'none' 
                    }}>
                      info@versoek.nl
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>📍</span>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                      {t('contact.info.address.title')}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      Groningen, Netherlands
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>🕐</span>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                      {t('contact.info.hours.title')}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      {t('contact.info.hours.weekdays')}<br/>
                      {t('contact.info.hours.weekend')}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '25px',
                borderRadius: '8px',
                marginTop: '30px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
                  {t('contact.info.demo.title')}
                </h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: '0.9' }}>
                  {t('contact.info.demo.description')}
                </p>
                <button 
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                        backgroundColor: 'white',
                        color: '#667eea',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                    >
                    {t('contact.info.demo.button')}
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div 
              id="contact-form"
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '25px',
                color: '#2c3e50'
              }}>
                {t('contact.form.title')}
              </h2>

              {status.message && (
                <div style={{
                  padding: '15px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: status.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.company')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.subject')} *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">{t('contact.form.subjectPlaceholder')}</option>
                    <option value="demo">{t('contact.form.subjects.demo')}</option>
                    <option value="pricing">{t('contact.form.subjects.pricing')}</option>
                    <option value="support">{t('contact.form.subjects.support')}</option>
                    <option value="other">{t('contact.form.subjects.other')}</option>
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    color: '#2c3e50',
                    fontWeight: '500'
                  }}>
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    backgroundColor: isSubmitting ? '#ccc' : '#667eea',
                    color: 'white',
                    padding: '15px',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                >
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
