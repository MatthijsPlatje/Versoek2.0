// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import './ProfilePage.css';

const ProfilePage = ({ user }) => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('/uploads/default-avatar.png');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users/profile', {
          headers: { 'x-auth-token': token }
      });
      const userData = res.data;
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setProfilePictureUrl(userData.profilePictureUrl || '/uploads/default-avatar.png');
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('/api/users/profile', { name, phoneNumber }, config);
      setMessage(t('profile.updateSuccess')); 
    } catch (err) {
      setMessage(err.response?.data?.msg || t('profile.updateError')); 
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePictureUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage(t('profile.selectFileFirst')); // UPDATED: Use translation
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.post('/api/users/profile/picture', formData, config);
      
      setProfilePictureUrl(res.data.profilePictureUrl);
      setMessage(t('profile.pictureUpdateSuccess')); // UPDATED: Use translation
      setSelectedFile(null);
    } catch (err) {
      setMessage(err.response?.data?.msg || t('profile.pictureUpdateError')); // UPDATED: Use translation
    }
  };

  if (!user) return <p>{t('profile.loading')}</p>; // UPDATED: Use translation

  return (
    <div className="profile-container">
      <h2>{t('profile.title')}</h2>
      
      <div className="profile-picture-section">
        <img 
          src={profilePictureUrl} 
          alt={t('profile.pictureAlt')}
          className="profile-avatar"
          onError={(e) => {
            console.error('Failed to load image:', profilePictureUrl);
            // Prevent infinite loop - only set default once
            if (e.target.src !== window.location.origin + '/uploads/default-avatar.png') {
              e.target.src = '/uploads/default-avatar.png';
            }
          }}
        />
        <form onSubmit={handlePictureUpload}>
          <div className="form-group">
            <label htmlFor="picture">{t('profile.updatePicture')}</label>
            <input type="file" id="picture" onChange={handleFileChange} accept="image/*" />
          </div>
          <button type="submit" className="upload-btn" disabled={!selectedFile}>
            {t('profile.uploadButton')}
          </button>
        </form>
      </div>

      <form onSubmit={handleUpdateProfile} className="profile-form">
        <div className="form-group">
          <label htmlFor="email">{t('profile.email')}</label>
          <input type="email" id="email" value={email} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="name">{t('profile.name')}</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">{t('profile.phone')}</label>
          <input 
            type="tel" 
            id="phoneNumber" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder={t('profile.phonePlaceholder')}
          />
        </div>
        <button type="submit" className="update-btn">
          {t('profile.updateButton')}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default ProfilePage;
