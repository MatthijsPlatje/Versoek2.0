// client/src/pages/CalendarDashboard.jsx

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import './CalendarDashboard.css';

const CalendarDashboard = () => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const [date, setDate] = useState(new Date());
  const [activities, setActivities] = useState({ driving: [], requesting: [], available: [] });
  const [selectedDayActivity, setSelectedDayActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const formatTime = (dateTimeInput) => {
    if (!dateTimeInput) return 'N/A';
    
    let dateTimeString;
    if (dateTimeInput instanceof Date) {
      const hour = String(dateTimeInput.getHours()).padStart(2, '0');
      const minute = String(dateTimeInput.getMinutes()).padStart(2, '0');
      return `${hour}:${minute}`;
    } else {
      dateTimeString = String(dateTimeInput);
    }
    
    const cleanString = dateTimeString.replace('T', ' ').substring(0, 19);
    const timePart = cleanString.split(' ')[1];
    
    if (!timePart) return dateTimeString;
    
    const [hour, minute] = timePart.split(':');
    return `${hour}:${minute}`;
  };

  // Helper function with detailed logging
  const generateRecurringInstances = (rules, actualRides, interval) => {
    let instances = [];
    if (!rules || rules.length === 0) return instances;

    const daysInInterval = eachDayOfInterval(interval);

    rules.forEach(rule => {
      let daysOfWeekArray;
      try {
        daysOfWeekArray = JSON.parse(rule.daysOfWeek);
      } catch (e) {
        return;
      }
      
      if (!Array.isArray(daysOfWeekArray)) return;

      daysInInterval.forEach(day => {
        const ruleStartDate = rule.startDate ? parseISO(rule.startDate) : null;
        const ruleEndDate = rule.endDate ? parseISO(rule.endDate) : null;

        const isAfterStartDate = !ruleStartDate || isEqual(day, ruleStartDate) || isAfter(day, ruleStartDate);
        const isBeforeEndDate = !ruleEndDate || isEqual(day, ruleEndDate) || isBefore(day, ruleEndDate);
        
        if (daysOfWeekArray.includes(day.getDay()) && isAfterStartDate && isBeforeEndDate) {
          const [hour, minute] = rule.departureTime.split(':');
          
          // FIXED: Create datetime string instead of Date object
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const dayNum = String(day.getDate()).padStart(2, '0');
          const candidateDateTimeString = `${year}-${month}-${dayNum} ${hour}:${minute}:00`;

          // Check if actual ride exists with same time
          const alreadyExists = actualRides.some(realRide => {
            // Parse both as strings to compare
            const realRideDateTime = String(realRide.departureTime).substring(0, 16); // "2025-10-21 08:30"
            const candidateDateTime = candidateDateTimeString.substring(0, 16);
            return realRide.driverId === rule.driverId && realRideDateTime === candidateDateTime;
          });
          
          if (!alreadyExists) {
            instances.push({
              id: `recurring-${rule.id}-${day.toISOString().slice(0, 10)}`,
              isRecurring: true,
              startPoint: rule.startPoint,
              endPoint: rule.endPoint,
              departureTime: candidateDateTimeString, // Store as string, not Date
              availableSeats: rule.seats,
              requests: []
            });
          }
        }
      });
    });
    return instances;
  };

  const fetchActivitiesForMonth = async (currentDate) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    
    const config = { headers: { 'x-auth-token': token } };
    const interval = { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      const [activityRes, recurringRes, availableRes] = await Promise.all([
        axios.get(`/api/activity?month=${month}&year=${year}`, config),
        axios.get('/api/recurring-rides', config),
        axios.get(`/api/rides/available?month=${month}&year=${year}`, config)
      ]);
      
      const actualDrivingRides = activityRes.data.driving || [];
      const recurringPlaceholders = generateRecurringInstances(recurringRes.data, actualDrivingRides, interval);
      
      const allDrivingActivities = [
        ...actualDrivingRides, // Don't parse - keep as string
        ...recurringPlaceholders
      ];

      const groupedActivities = {
        driving: allDrivingActivities,
        requesting: (activityRes.data.requesting || []),
        available: (availableRes.data || [])
      };
      
      setActivities(groupedActivities);
      updateSelectedDayDetails(date, groupedActivities);

    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError(t('calendar.errors.loadFailed')); // UPDATED: Use translation
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedDayDetails = (selectedDate, currentActivities) => {
    if (!currentActivities) return;
    
    // Helper to compare date string with Date object
    const isSameDayString = (dateTimeString, compareDate) => {
      if (dateTimeString instanceof Date) {
        return isSameDay(dateTimeString, compareDate);
      }
      // Parse string without timezone: "2025-10-21 08:30:00"
      const dateStr = String(dateTimeString).substring(0, 10); // "2025-10-21"
      const [year, month, day] = dateStr.split('-');
      const dateObj = new Date(year, month - 1, day);
      return isSameDay(dateObj, compareDate);
    };
    
    const dayActivity = {
      driving: currentActivities.driving.filter(ride => isSameDayString(ride.departureTime, selectedDate)),
      requesting: currentActivities.requesting.filter(req => isSameDayString(req.Ride.departureTime, selectedDate)),
      available: currentActivities.available.some(ride => isSameDay(parseISO(ride.departureTime), selectedDate))
    };
    setSelectedDayActivity(dayActivity);
  };
  
  useEffect(() => {
    fetchActivitiesForMonth(new Date());
  }, []);

  const handleDateClick = (value) => {
    setDate(value);
    updateSelectedDayDetails(value, activities);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setDate(activeStartDate); 
    fetchActivitiesForMonth(activeStartDate);
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/requests/${requestId}/update`, { status }, { headers: { 'x-auth-token': token } });
      fetchActivitiesForMonth(date);
    } catch (err) {
      alert(`${t('common.error')}: ${err.response?.data?.message || t('calendar.errors.updateFailed')}`); // UPDATED: Use translation
    }
  };

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const isSameDayString = (dateTimeString, compareDate) => {
        if (dateTimeString instanceof Date) {
          return isSameDay(dateTimeString, compareDate);
        }
        const dateStr = String(dateTimeString).substring(0, 10);
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(year, month - 1, day);
        return isSameDay(dateObj, compareDate);
      };
      
      const isActualDriving = activities.driving.some(ride => isSameDayString(ride.departureTime, date) && !ride.isRecurring);
      const isRecurringPlaceholder = activities.driving.some(ride => isSameDayString(ride.departureTime, date) && ride.isRecurring);
      const isRequesting = activities.requesting.some(req => isSameDayString(req.Ride.departureTime, date));
      const areRidesAvailable = activities.available.some(ride => isSameDay(parseISO(ride.departureTime), date));
      
      return (
        <div className="activity-dots">
          {isActualDriving && <div className="dot driving-dot" title={t('calendar.legend.actualRide')}></div>}
          {isRecurringPlaceholder && <div className="dot recurring-dot" title={t('calendar.legend.recurringPlan')}></div>}
          {isRequesting && <div className="dot requesting-dot" title={t('calendar.legend.youRequested')}></div>}
          {areRidesAvailable && <div className="dot available-dot" title={t('calendar.legend.ridesAvailable')}></div>}
        </div>
      );
    }
    return null;
  };
  
  const toYYYYMMDD = (d) => format(d, 'yyyy-MM-dd');

  if (loading) return <p>{t('calendar.loading')}</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="dashboard-wrapper">
      <div className="demo-warning-banner">
        <span className="warning-icon">⚠️</span>
        <div className="warning-content">
          <strong>{t('demo.warning.title', 'Demo Mode')}</strong>
          <span>{t('demo.warning.message', 'This platform is currently for demonstration purposes only. The data shown is fake and rides cannot actually be booked at this time.')}</span>
        </div>
      </div>
      {/* Quick Links Section - Full Width */}
      <div className="quick-links-section">
        <Link to="/my-rides" className="quick-link-card">
          <span className="quick-link-icon">📋</span>
          <span className="quick-link-text">{t('calendar.quickLinks.myRides', 'My Rides')}</span>
        </Link>
        <Link to="/offer-ride" className="quick-link-card">
          <span className="quick-link-icon">➕</span>
          <span className="quick-link-text">{t('calendar.quickLinks.createRide', 'Create Ride')}</span>
        </Link>
        <Link to="/agenda" className="quick-link-card">
          <span className="quick-link-icon">🔍</span>
          <span className="quick-link-text">{t('calendar.quickLinks.findRides', 'Find Rides')}</span>
        </Link>
        <Link to="/ride-requests" className="quick-link-card">
          <span className="quick-link-icon">📬</span>
          <span className="quick-link-text">{t('calendar.quickLinks.requests', 'Requests')}</span>
        </Link>
        <Link to="/profile" className="quick-link-card">
          <span className="quick-link-icon">👤</span>
          <span className="quick-link-text">{t('nav.profile', 'Profile')}</span>
        </Link>
      </div>

      {/* Original Container Structure */}
      <div className="dashboard-container">
        <div className="calendar-panel">
          <h2>{t('calendar.title')}</h2>
          <div className="legend">
            <div><span className="dot driving-dot"></span> {t('calendar.legend.actualRide')}</div>
            <div><span className="dot recurring-dot"></span> {t('calendar.legend.recurringPlan')}</div>
            <div><span className="dot requesting-dot"></span> {t('calendar.legend.youRequested')}</div>
            <div><span className="dot available-dot"></span> {t('calendar.legend.ridesAvailable')}</div>
          </div>
          <Calendar 
            onChange={handleDateClick} 
            value={date}
            tileContent={renderTileContent}
            onActiveStartDateChange={handleActiveStartDateChange}
          />
        </div>

        <div className="right-panel">
          <div className="details-panel">
            <h3>{t('calendar.detailsFor')} {format(date, 'MMMM d, yyyy')}</h3>
            <div className="button-group top-buttons">
              <button onClick={() => navigate(`/offer-ride?date=${toYYYYMMDD(date)}`)}>
                {t('calendar.offerRide')}
              </button>
              {/* <button onClick={() => navigate('/agenda')}>
                {t('calendar.findRide')}
              </button> */}
            </div>
            <hr />

            {selectedDayActivity ? (
              <div className="activity-list">
                {selectedDayActivity.driving.map(ride => (
                  <div key={ride.id} className="activity-card driver-card">
                    <h4>
                      {t('calendar.youAreDriving')}
                      {ride.isRecurring && <span className="recurring-badge">({t('calendar.recurringPlan')})</span>}
                    </h4>
                    <p><strong>{t('calendar.time')}:</strong> {formatTime(ride.departureTime)}</p>
                    
                    {!ride.isRecurring ? (
                      <>
                        <p><strong>{t('calendar.seatsAvailable')}:</strong> {ride.availableSeats}</p>
                        <Link to={`/ride/${ride.id}`}>{t('calendar.viewManifest')}</Link>
                      </>
                    ) : (
                      <p style={{fontStyle: 'italic', color: '#555'}}>
                        {t('calendar.recurringPlaceholderInfo')}
                      </p>
                    )}
                  </div>
                ))}

                {selectedDayActivity.requesting.map(req => (
                  <div key={`passenger-${req.id}`} className="activity-card passenger-card">
                    <h4>{t('calendar.youArePassenger')}</h4>
                    <p><strong>{t('calendar.driver')}:</strong> <Link to={`/users/${req.Ride.driver.id}`}>{req.Ride.driver.name}</Link></p>
                    <p><strong>{t('calendar.time')}:</strong> {formatTime(req.Ride.departureTime)}</p>
                    <p><strong>{t('calendar.status')}:</strong> <span className={`status-${req.status}`}>{req.status}</span></p>
                    <Link to={`/ride/${req.Ride.id}`}>{t('calendar.viewRideDetails')}</Link>
                  </div>
                ))}

                {selectedDayActivity.available && (
                  <div className="activity-card available-rides-link-card">
                    <h4>{t('calendar.otherRidesAvailable')}</h4>
                    <p>{t('calendar.otherRidesInfo')}</p>
                    <button onClick={() => navigate(`/agenda?date=${toYYYYMMDD(date)}`)}>
                      {t('calendar.viewAllRides')}
                    </button>
                  </div>
                )}

                {selectedDayActivity.driving.length === 0 && selectedDayActivity.requesting.length === 0 && !selectedDayActivity.available && (
                  <div className="no-activity-card"><p>{t('calendar.noActivity')}</p></div>
                )}
              </div>
            ) : (
              <div className="no-activity-card"><p>{t('calendar.selectDay')}</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarDashboard;
