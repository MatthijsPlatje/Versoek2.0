import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RideRequests = () => {
  const { t } = useTranslation();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      const receivedRes = await axios.get('/api/requests/received', config);
      setPendingRequests(receivedRes.data);

      const sentRes = await axios.get('/api/requests/sent', config);
      setMyRequests(sentRes.data);

    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/requests/${requestId}/update`, { status }, config);
      
      alert(t(`rideRequests.received.${status}`));
      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      alert(err.response?.data?.message || t('rideRequests.received.updateFailed'));
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm(t('rideRequests.sent.confirmCancel'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/requests/${requestId}/cancel`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      alert(t('rideRequests.sent.cancelled'));
      fetchRequests();
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert(err.response?.data?.message || t('rideRequests.sent.cancelFailed'));
    }
  };

  const parseLocation = (locationData) => {
    try {
        const parsed = typeof locationData === 'string' ? JSON.parse(locationData) : locationData;
        
        if (parsed.address) return parsed.address;
        if (parsed.name) return parsed.name;
        
        if (parsed.lat && parsed.lng) {
          return `${t('common.coordinates', 'Coordinates')}: ${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`;
        }
        
        return t('common.locationNotSpecified', 'Location not specified');
    } catch (e) {
        console.error('Error parsing location:', locationData, e);
        return t('common.locationNotSpecified', 'Location not specified');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t('common.invalidDate', 'Invalid Date');
    return new Date(dateString).toLocaleString(t('common.locale', 'en-US'), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const tabContainerStyles = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e0e0e0'
  };

  const tabStyles = (isActive) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: isActive ? '#2c5f2d' : 'transparent',
    color: isActive ? 'white' : '#333',
    borderRadius: '5px 5px 0 0',
    fontSize: '1rem',
    transition: 'all 0.3s'
  });

  const cardStyles = {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const buttonStyles = (color) => ({
    padding: '8px 16px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '0.9rem'
  });

  const badgeStyles = (status) => {
    const colors = {
      pending: '#ffc107',
      accepted: '#28a745',
      refused: '#dc3545'
    };
    return {
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: colors[status] || '#6c757d',
      color: 'white',
      borderRadius: '12px',
      fontSize: '0.85rem',
      marginLeft: '10px'
    };
  };

  if (loading) {
    return <div style={containerStyles}><p>{t('rideRequests.loading')}</p></div>;
  }

  return (
    <div style={containerStyles}>
      <h1>{t('rideRequests.title')}</h1>

      <div style={tabContainerStyles}>
        <button 
          style={tabStyles(activeTab === 'received')}
          onClick={() => setActiveTab('received')}
        >
          {t('rideRequests.tabs.received')} ({pendingRequests.length})
        </button>
        <button 
          style={tabStyles(activeTab === 'sent')}
          onClick={() => setActiveTab('sent')}
        >
          {t('rideRequests.tabs.sent')} ({myRequests.length})
        </button>
      </div>

      {activeTab === 'received' && (
        <div>
          <h2>{t('rideRequests.received.title')}</h2>
          {pendingRequests.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('rideRequests.received.noRequests')}</p>
            </div>
          ) : (
            pendingRequests.map(request => (
              <div key={request.id} style={cardStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>
                      {request.passenger?.name || t('rideRequests.received.passenger')}
                      <span style={badgeStyles(request.status)}>{t(`rideRequests.status.${request.status}`)}</span>
                    </h3>
                    <p><strong>{t('rideRequests.received.ride')}:</strong> {parseLocation(request.Ride?.startPoint)} → {parseLocation(request.Ride?.endPoint)}</p>
                    <p><strong>{t('rideRequests.received.departure')}:</strong> {formatDateTime(request.Ride?.departureTime)}</p>
                    <p><strong>{t('rideRequests.received.pickupLocation')}:</strong> {parseLocation(request.pickupLocation)}</p>
                    <p><strong>{t('rideRequests.received.requested')}:</strong> {formatDateTime(request.createdAt)}</p>
                    <Link to={`/ride/${request.rideId}`} style={{ color: '#2c5f2d' }}>
                      {t('rideRequests.received.viewRide')}
                    </Link>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div>
                      <button 
                        style={buttonStyles('#28a745')}
                        onClick={() => handleUpdateRequest(request.id, 'accepted')}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        {t('rideRequests.received.accept')}
                      </button>
                      <button 
                        style={buttonStyles('#dc3545')}
                        onClick={() => handleUpdateRequest(request.id, 'refused')}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                      >
                        {t('rideRequests.received.decline')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div>
          <h2>{t('rideRequests.sent.title')}</h2>
          {myRequests.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('rideRequests.sent.noRequests')}</p>
              <Link to="/agenda" style={{ color: '#2c5f2d' }}>{t('rideRequests.sent.findLink')}</Link>
            </div>
          ) : (
            myRequests.map(request => (
              <div key={request.id} style={cardStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>
                      {parseLocation(request.Ride?.startPoint)} → {parseLocation(request.Ride?.endPoint)}
                      <span style={badgeStyles(request.status)}>{t(`rideRequests.status.${request.status}`)}</span>
                    </h3>
                    <p><strong>{t('rideRequests.sent.driver')}:</strong> {request.Ride?.driver?.name || t('rideRequests.sent.driver')}</p>
                    <p><strong>{t('rideRequests.sent.departure')}:</strong> {formatDateTime(request.Ride?.departureTime)}</p>
                    <p><strong>{t('rideRequests.sent.yourPickup')}:</strong> {parseLocation(request.pickupLocation)}</p>
                    <p><strong>{t('rideRequests.sent.requested')}:</strong> {formatDateTime(request.createdAt)}</p>
                    <Link to={`/ride/${request.rideId}`} style={{ color: '#2c5f2d' }}>
                      {t('rideRequests.sent.viewRide')}
                    </Link>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div>
                      <button 
                        style={buttonStyles('#dc3545')}
                        onClick={() => handleCancelRequest(request.id)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                      >
                        {t('rideRequests.sent.cancelRequest')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RideRequests;
