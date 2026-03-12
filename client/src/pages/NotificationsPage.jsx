// client/src/pages/NotificationsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotificationsPage.css';

// Import notification count utility
import { setCount } from '../utils/notificationCount';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get('/api/notifications', config);
      setNotifications(res.data);

      // Update unread count immediately based on fetched notifications
      const unreadCount = res.data.filter(n => !n.isRead).length;
      setCount(unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/notifications/${notification.id}/mark-read`, {}, config);

      // Optimistically update notifications state locally
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );

      // Update unread count in utility and trigger header update immediately
      setCount(prevCount => Math.max(prevCount - 1, 0));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }

    if (notification.rideId) {
      navigate(`/ride/${notification.rideId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/notifications/mark-all-read`, {}, config);

      // Optimistically mark all as read and update count
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page-container">
        <h2>{t('notifications.title')}</h2>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="notifications-page-container">
      <h2>{t('notifications.title')}</h2>
      {notifications.length > 0 ? (
        <>
          <button onClick={handleMarkAllRead} className="mark-all-btn">
            {t('notifications.markAllRead')}
          </button>
          <ul className="notifications-list">
            {notifications.map(notif => (
              <li key={notif.id} className={!notif.isRead ? 'unread' : ''}>
                <button onClick={() => handleNotificationClick(notif)} className="notification-item-button">
                  <span className="message">{notif.message}</span>
                  <span className="date">{new Date(notif.createdAt).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>{t('notifications.noNotifications')}</p>
      )}
    </div>
  );
};

export default NotificationsPage;
