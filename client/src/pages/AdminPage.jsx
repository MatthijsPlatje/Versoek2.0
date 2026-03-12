// client/src/pages/AdminPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminPage.css';

const AdminPage = () => {
  const { t } = useTranslation();

  return (
    <div className="admin-page">
      <div className="demo-warning-banner">
        <span className="warning-icon">⚠️</span>
        <div className="warning-content">
          <strong>{t('demo.warning.title', 'Demo Mode')}</strong>
          <span>{t('demo.warning.message', 'This platform is currently for demonstration purposes only. The data shown is fake and rides cannot actually be booked at this time.')}</span>
        </div>
      </div>
      <div className="admin-header">
        <h1>{t('adminPage.title')}</h1>
        <p className="admin-subtitle">{t('adminPage.subtitle')}</p>
      </div>

      <div className="admin-cards-grid">
        <Link to="/admin/users" className="admin-card">
          <div className="card-icon">👥</div>
          <h2>{t('adminPage.userManagement.title')}</h2>
          <p>{t('adminPage.userManagement.description')}</p>
          <div className="card-features">
            <span>✓ {t('adminPage.userManagement.features.bulkUpload')}</span>
            <span>✓ {t('adminPage.userManagement.features.editDetails')}</span>
            <span>✓ {t('adminPage.userManagement.features.departmentManagement')}</span>
            <span>✓ {t('adminPage.userManagement.features.resendInvitations')}</span>
          </div>
          <div className="card-arrow">→</div>
        </Link>

        <Link to="/admin/analytics" className="admin-card">
          <div className="card-icon">📊</div>
          <h2>{t('adminPage.analytics.title')}</h2>
          <p>{t('adminPage.analytics.description')}</p>
          <div className="card-features">
            <span>✓ {t('adminPage.analytics.features.realtimeKpis')}</span>
            <span>✓ {t('adminPage.analytics.features.co2Tracking')}</span>
            <span>✓ {t('adminPage.analytics.features.userEngagement')}</span>
            <span>✓ {t('adminPage.analytics.features.exportReports')}</span>
          </div>
          <div className="card-arrow">→</div>
        </Link>
      </div>

      <div className="admin-stats-preview">
        <div className="stat-box">
          <span className="stat-icon">🚗</span>
          <div className="stat-content">
            <h3>{t('adminPage.preview.platformOverview.title')}</h3>
            <p>{t('adminPage.preview.platformOverview.description')}</p>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">🌱</span>
          <div className="stat-content">
            <h3>{t('adminPage.preview.sustainabilityFocus.title')}</h3>
            <p>{t('adminPage.preview.sustainabilityFocus.description')}</p>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">📈</span>
          <div className="stat-content">
            <h3>{t('adminPage.preview.dataInsights.title')}</h3>
            <p>{t('adminPage.preview.dataInsights.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
