import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MyRides = () => {
  const { t } = useTranslation();
  const [recurringRides, setRecurringRides] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [pastRides, setPastRides] = useState([]);
  const [passengerRides, setPassengerRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recurring');

  useEffect(() => {
    fetchAllRides();
  }, []);

  const formatDateTime = (dateTimeInput) => {
    if (!dateTimeInput) return 'N/A';
    
    let dateTimeString;
    if (dateTimeInput instanceof Date) {
      const year = dateTimeInput.getFullYear();
      const month = String(dateTimeInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateTimeInput.getDate()).padStart(2, '0');
      const hour = String(dateTimeInput.getHours()).padStart(2, '0');
      const minute = String(dateTimeInput.getMinutes()).padStart(2, '0');
      dateTimeString = `${year}-${month}-${day} ${hour}:${minute}:00`;
    } else {
      dateTimeString = String(dateTimeInput);
    }
    
    const cleanString = dateTimeString.replace('T', ' ').substring(0, 19);
    const [datePart, timePart] = cleanString.split(' ');
    
    if (!datePart || !timePart) return dateTimeString;
    
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    const date = new Date(year, month - 1, day);
    const dateFormatted = date.toLocaleDateString();
    
    return `${dateFormatted} ${hour}:${minute}`;
  };

  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      const recurringRes = await axios.get('/api/recurring-rides', config);
      setRecurringRides(recurringRes.data);

      const ridesRes = await axios.get('/api/rides/my-rides?asDriver=true', config);      
      // Parse datetime without timezone conversion for comparison
      const parseDateTime = (dateTimeString) => {
        const cleanString = dateTimeString.replace('T', ' ').substring(0, 19);
        const [datePart, timePart] = cleanString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        return new Date(year, month - 1, day, hour, minute, second || 0);
      };

      const now = new Date();
      const upcoming = ridesRes.data.filter(ride => parseDateTime(ride.departureTime) > now);
      const past = ridesRes.data.filter(ride => parseDateTime(ride.departureTime) <= now);
      
      setUpcomingRides(upcoming);
      setPastRides(past);

      const passengerRes = await axios.get('/api/rides/my-rides?asPassenger=true', config);
      setPassengerRides(passengerRes.data);

    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRecurringRide = async (recurringRideId) => {
    if (!window.confirm(t('myRides.recurring.confirmCancel'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/recurring-rides/${recurringRideId}/cancel`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      alert(t('myRides.alerts.patternCancelled'));
      fetchAllRides();
    } catch (err) {
      console.error('Error cancelling recurring ride:', err);
      alert(err.response?.data?.message || t('myRides.alerts.patternCancelFailed'));
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm(t('myRides.upcoming.confirmCancel'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/rides/${rideId}/cancel`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      alert(t('myRides.alerts.rideCancelled'));
      fetchAllRides();
    } catch (err) {
      console.error('Error cancelling ride:', err);
      alert(err.response?.data?.message || t('myRides.alerts.rideCancelFailed'));
    }
  };

  const formatDaysOfWeek = (daysData) => {
    const dayNames = [
      t('days.sun', 'Sun'),
      t('days.mon', 'Mon'),
      t('days.tue', 'Tue'),
      t('days.wed', 'Wed'),
      t('days.thu', 'Thu'),
      t('days.fri', 'Fri'),
      t('days.sat', 'Sat')
    ];
    
    if (Array.isArray(daysData)) {
      return daysData.map(day => dayNames[day]).join(', ');
    }
    
    try {
      const parsed = typeof daysData === 'string' ? JSON.parse(daysData) : daysData;
      if (Array.isArray(parsed)) {
        return parsed.map(day => dayNames[day]).join(', ');
      }
    } catch (e) {
      console.error('Error parsing days of week:', e, daysData);
    }
    
    return 'N/A';
  };

  const parseLocation = (locationData) => {
    try {
      const parsed = typeof locationData === 'string' ? JSON.parse(locationData) : locationData;
      return parsed.address || parsed.name || 'Location';
    } catch (e) {
      return 'Location';
    }
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
    borderBottom: '2px solid #e0e0e0',
    flexWrap: 'wrap'
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

  const buttonStyles = {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '0.9rem'
  };

  const viewButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#2c5f2d'
  };

  const badgeStyles = (color) => ({
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: color,
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginLeft: '10px'
  });

  if (loading) {
    return <div style={containerStyles}><p>{t('myRides.loading')}</p></div>;
  }

  return (
    <div style={containerStyles}>
      <h1>{t('myRides.title')}</h1>

      <div style={tabContainerStyles}>
        <button 
          style={tabStyles(activeTab === 'recurring')}
          onClick={() => setActiveTab('recurring')}
          onMouseEnter={(e) => activeTab !== 'recurring' && (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => activeTab !== 'recurring' && (e.target.style.backgroundColor = 'transparent')}
        >
          {t('myRides.tabs.recurring')} ({recurringRides.length})
        </button>
        <button 
          style={tabStyles(activeTab === 'upcoming')}
          onClick={() => setActiveTab('upcoming')}
          onMouseEnter={(e) => activeTab !== 'upcoming' && (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => activeTab !== 'upcoming' && (e.target.style.backgroundColor = 'transparent')}
        >
          {t('myRides.tabs.upcoming')} ({upcomingRides.length})
        </button>
        <button 
          style={tabStyles(activeTab === 'past')}
          onClick={() => setActiveTab('past')}
          onMouseEnter={(e) => activeTab !== 'past' && (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => activeTab !== 'past' && (e.target.style.backgroundColor = 'transparent')}
        >
          {t('myRides.tabs.past')} ({pastRides.length})
        </button>
        <button 
          style={tabStyles(activeTab === 'passenger')}
          onClick={() => setActiveTab('passenger')}
          onMouseEnter={(e) => activeTab !== 'passenger' && (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => activeTab !== 'passenger' && (e.target.style.backgroundColor = 'transparent')}
        >
          {t('myRides.tabs.passenger')} ({passengerRides.length})
        </button>
      </div>

      {activeTab === 'recurring' && (
        <div>
          <h2>{t('myRides.recurring.title')}</h2>
          {recurringRides.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('myRides.recurring.noPatterns')}</p>
              <Link to="/offer-ride" style={{ color: '#2c5f2d' }}>{t('myRides.recurring.createLink')}</Link>
            </div>
          ) : (
            recurringRides.map(ride => (
              <div key={ride.id} style={cardStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>
                      {parseLocation(ride.startPoint)} → {parseLocation(ride.endPoint)}
                    </h3>
                    <p><strong>{t('myRides.recurring.days')}:</strong> {formatDaysOfWeek(ride.daysOfWeek)}</p>
                    <p><strong>{t('myRides.recurring.time')}:</strong> {ride.departureTime}</p>
                    <p><strong>{t('myRides.recurring.seats')}:</strong> {ride.seats}</p>
                    <p><strong>{t('myRides.recurring.startDate')}:</strong> {new Date(ride.startDate).toLocaleDateString()}</p>
                    <p><strong>{t('myRides.recurring.endDate')}:</strong> {ride.endDate ? new Date(ride.endDate).toLocaleDateString() : t('myRides.recurring.noEndDate')}</p>
                    {new Date(ride.endDate) < new Date() && ride.endDate && (
                      <span style={badgeStyles('#6c757d')}>{t('myRides.recurring.expired')}</span>
                    )}
                  </div>
                  <div>
                    <button 
                      style={buttonStyles}
                      onClick={() => handleCancelRecurringRide(ride.id)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      {t('myRides.recurring.cancelPattern')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div>
          <h2>{t('myRides.upcoming.title')}</h2>
          {upcomingRides.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('myRides.upcoming.noRides')}</p>
              <Link to="/create-ride" style={{ color: '#2c5f2d' }}>{t('myRides.upcoming.createLink')}</Link>
            </div>
          ) : (
            upcomingRides.map(ride => (
              <div key={ride.id} style={cardStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>
                      {parseLocation(ride.startPoint)} → {parseLocation(ride.endPoint)}
                    </h3>
                    <p><strong>{t('myRides.common.departure')}:</strong> {formatDateTime(ride.departureTime)}</p>
                    <p><strong>{t('myRides.upcoming.seatsLeft')}:</strong> {ride.availableSeats}</p>
                    {ride.requests && ride.requests.filter(r => r.status === 'accepted').length > 0 && (
                      <p>
                        <strong>{t('myRides.upcoming.passengers')}:</strong> {ride.requests.filter(r => r.status === 'accepted').length}
                        <span style={badgeStyles('#28a745')}>
                          {ride.requests.filter(r => r.status === 'accepted').length} {t('myRides.upcoming.confirmed')}
                        </span>
                      </p>
                    )}
                    {ride.requests && ride.requests.filter(r => r.status === 'pending').length > 0 && (
                      <span style={badgeStyles('#ffc107')}>
                        {ride.requests.filter(r => r.status === 'pending').length} {t('myRides.upcoming.pendingRequests')}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link to={`/ride/${ride.id}`}>
                      <button 
                        style={viewButtonStyles}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#245a24'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2c5f2d'}
                      >
                        {t('myRides.upcoming.viewDetails')}
                      </button>
                    </Link>
                    <button 
                      style={buttonStyles}
                      onClick={() => handleCancelRide(ride.id)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      {t('myRides.upcoming.cancelRide')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          <h2>{t('myRides.past.title')}</h2>
          {pastRides.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('myRides.past.noRides')}</p>
            </div>
          ) : (
            pastRides.map(ride => (
              <div key={ride.id} style={cardStyles}>
                <h3 style={{ marginTop: 0, color: '#6c757d' }}>
                  {parseLocation(ride.startPoint)} → {parseLocation(ride.endPoint)}
                  <span style={badgeStyles('#6c757d')}>{t('myRides.past.completed')}</span>
                </h3>
                <p><strong>{t('myRides.common.departure')}:</strong> {formatDateTime(ride.departureTime)}</p>
                {ride.requests && ride.requests.filter(r => r.status === 'accepted').length > 0 && (
                  <p><strong>{t('myRides.past.passengers')}:</strong> {ride.requests.filter(r => r.status === 'accepted').length}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'passenger' && (
        <div>
          <h2>{t('myRides.passenger.title')}</h2>
          {passengerRides.length === 0 ? (
            <div style={cardStyles}>
              <p>{t('myRides.passenger.noRides')}</p>
              <Link to="/agenda" style={{ color: '#2c5f2d' }}>{t('myRides.passenger.findLink')}</Link>
            </div>
          ) : (
            passengerRides.map(ride => (
              <div key={ride.id} style={cardStyles}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, color: '#2c5f2d' }}>
                      {parseLocation(ride.startPoint)} → {parseLocation(ride.endPoint)}
                    </h3>
                    <p><strong>{t('myRides.passenger.driver')}:</strong> {ride.driver?.name}</p>
                    <p><strong>{t('myRides.passenger.departure')}:</strong> {formatDateTime(ride.departureTime)}</p>
                    {ride.myRequest && (
                      <span style={badgeStyles(
                        ride.myRequest.status === 'accepted' ? '#28a745' : 
                        ride.myRequest.status === 'pending' ? '#ffc107' : '#dc3545'
                      )}>
                        {t(`rideRequests.status.${ride.myRequest.status}`)}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link to={`/ride/${ride.id}`}>
                      <button 
                        style={viewButtonStyles}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#245a24'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2c5f2d'}
                      >
                        {t('myRides.passenger.viewDetails')}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyRides;
