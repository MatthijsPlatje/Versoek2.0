// client/src/components/Notifications.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Notifications.css';

// Import notification count utility
import { setCount } from '../utils/notificationCount';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const url = id === 'all'
        ? '/api/notifications/mark-all-read'
        : `/api/notifications/${id}/mark-read`;

      await axios.post(url, {}, config);

      // Optimistically update notifications state
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setCount(0);
      } else {
        setNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          )
        );
        setCount(prevCount => Math.max(prevCount - 1, 0));
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  if (loading) {
    return <div className="notifications-container"><p>Loading notifications...</p></div>;
  }

  return (
    <div className="notifications-container">
      <h3>Your Notifications</h3>
      {notifications.length > 0 ? (
        <>
          <button
            onClick={() => handleMarkAsRead('all')}
            className="mark-all-btn"
          >
            Mark All as Read
          </button>
          <ul className="notifications-list">
            {notifications.map(notif => (
              <li key={notif.id} className="notification-item">
                <p>{notif.message}</p>
                <span className="notification-date">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
                <button onClick={() => handleMarkAsRead(notif.id)} className="mark-one-btn">
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>You have no new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;
