import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '8px 16px',
          backgroundColor: i18n.resolvedLanguage === 'en' ? '#667eea' : '#f0f0f0',
          color: i18n.resolvedLanguage === 'en' ? 'white' : '#333',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: i18n.resolvedLanguage === 'en' ? 'bold' : 'normal',
          transition: 'all 0.2s'
        }}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('nl')}
        style={{
          padding: '8px 16px',
          backgroundColor: i18n.resolvedLanguage === 'nl' ? '#667eea' : '#f0f0f0',
          color: i18n.resolvedLanguage === 'nl' ? 'white' : '#333',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: i18n.resolvedLanguage === 'nl' ? 'bold' : 'normal',
          transition: 'all 0.2s'
        }}
      >
        Nederlands
      </button>
    </div>
  );
};

export default LanguageSwitcher;
