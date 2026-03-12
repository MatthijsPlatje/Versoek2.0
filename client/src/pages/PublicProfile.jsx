// client/src/pages/PublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import './ProfilePage.css';

const PublicProfile = () => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/users/${userId}`, {
          headers: { 'x-auth-token': token }
        });
        setProfile(res.data);
      } catch (err) {
        setError(t('publicProfile.errorLoad')); // UPDATED: Use translation
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, t]);

  if (loading) return <p>{t('publicProfile.loading')}</p>; // UPDATED: Use translation
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>{t('publicProfile.notFound')}</p>; // UPDATED: Use translation

  return (
    <div className="profile-container" style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>{t('publicProfile.title', { name: profile.name })}</h2>
      <div className="profile-picture-section">
        <img 
          src={`${profile.profilePictureUrl}`} 
          alt={t('publicProfile.pictureAlt', { name: profile.name })}
          className="profile-avatar"
        />
      </div>
      <div className="profile-form">
        <div className="form-group">
          <label>{t('publicProfile.fullName')}</label>
          <p>{profile.name}</p>
        </div>
        <div className="form-group">
          <label>{t('publicProfile.email')}</label>
          <p>{profile.email}</p>
        </div>
        <div className="form-group">
          <label>{t('publicProfile.phone')}</label>
          <p>{profile.phoneNumber || t('publicProfile.notProvided')}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
