// client/src/pages/OfferRide.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import RoutingMachine from '../components/RoutingMachine';
import L from 'leaflet';
import { format } from 'date-fns';
import './OfferRide.css';

const GEOAPIFY_API_KEY = 'bf814e88d83e428296bea24ca521aaac';
const startIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const endIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });

const MapClickHandler = ({ onMapClick, disabled }) => {
  useMapEvents({
    click(e) { if (!disabled) onMapClick(e.latlng); },
  });
  return null;
};

const OfferRide = () => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [availableSeats, setAvailableSeats] = useState(1);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState('start');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [rideType, setRideType] = useState('single');
  const [isRecurring, setIsRecurring] = useState(false);
  const [returnTime, setReturnTime] = useState('17:00');
  const [isReturnRide, setIsReturnRide] = useState(false);
  
  const [singleRideDate, setSingleRideDate] = useState('');
  const [isReturnRideSingle, setIsReturnRideSingle] = useState(false);
  const [singleReturnTime, setSingleReturnTime] = useState('17:00');

  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [departureTime, setDepartureTime] = useState('08:00');
  const [returnTimeRecurring, setReturnTimeRecurring] = useState('17:00');
  const [isReturnRideRecurring, setIsReturnRideRecurring] = useState(false);
  const todayString = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(todayString);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateFromURL = params.get('date');
    if (dateFromURL) {
      setSingleRideDate(dateFromURL + 'T09:00');
    } else {
      const today = new Date();
      today.setHours(today.getHours() + 1, 0, 0, 0);
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const hours = today.getHours().toString().padStart(2, '0');
      const minutes = today.getMinutes().toString().padStart(2, '0');
      setSingleRideDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [location.search]);

  const handleMapClick = async (latlng) => {
    setIsGeocoding(true);
    setError('');
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latlng.lat}&lon=${latlng.lng}&apiKey=${GEOAPIFY_API_KEY}`;
    try {
      const res = await axios.get(url);
      const address = res.data.features.length > 0 ? res.data.features[0].properties.formatted : `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;
      const locationObject = { name: address, lat: latlng.lat, lng: latlng.lng };

      if (selecting === 'start') {
        setStartPoint(locationObject);
        setSelecting('end');
      } else if (selecting === 'end') {
        setEndPoint(locationObject);
        setSelecting('done');
      }
    } catch (err) {
      setError(t('offerRide.errors.addressFetch')); // UPDATED: Use translation
    } finally {
      setIsGeocoding(false);
    }
  };

  const resetPoints = () => {
    setStartPoint(null);
    setEndPoint(null);
    setSelecting('start');
  };

  const handleDayToggle = (day) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startPoint || !endPoint) {
      setError(t('offerRide.errors.selectPoints')); // UPDATED: Use translation
      return;
    }

    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };

    try {
      if (rideType === 'recurring') {
        if (daysOfWeek.length === 0) {
          setError(t('offerRide.errors.selectDays')); // UPDATED: Use translation
          return;
        }

        const recurringPayload = {
          startPoint: JSON.stringify(startPoint),
          endPoint: JSON.stringify(endPoint),
          daysOfWeek: daysOfWeek,
          departureTime: departureTime,
          returnTime: isReturnRideRecurring ? returnTimeRecurring : null,
          seats: parseInt(availableSeats, 10),
          startDate: startDate,
          endDate: endDate || null,
        };
        await axios.post('/api/recurring-rides', recurringPayload, config);
        alert(t('offerRide.success.recurring')); // UPDATED: Use translation

      } else {
        // Parse the date to get YYYY-MM-DD HH:MM:SS format WITHOUT timezone conversion
        const dateObj = new Date(singleRideDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        const departureDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:00`;
        
        const singlePayload = {
          startPoint: JSON.stringify(startPoint),
          endPoint: JSON.stringify(endPoint),
          departureTime: departureDateTimeString,  // Send as string, not ISO
          availableSeats: parseInt(availableSeats, 10),
          returnTime: isReturnRideSingle ? singleReturnTime : null,
        };
        await axios.post('/api/rides', singlePayload, config);
        alert(t('offerRide.success.single'));
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('offerRide.errors.unexpected')); // UPDATED: Use translation
    }
  };

  const days = [
    { label: t('offerRide.days.monday'), value: 1 },
    { label: t('offerRide.days.tuesday'), value: 2 },
    { label: t('offerRide.days.wednesday'), value: 3 },
    { label: t('offerRide.days.thursday'), value: 4 },
    { label: t('offerRide.days.friday'), value: 5 },
    { label: t('offerRide.days.saturday'), value: 6 },
    { label: t('offerRide.days.sunday'), value: 0 }
  ];

  return (
    <div className="offer-ride-container">
      <div className="offer-ride-header">
        <h2>{t('offerRide.title')}</h2>
        <p>{t('offerRide.subtitle')}</p>
      </div>
      
      <div className="form-card">
        <h3>{t('offerRide.step1.title')}</h3>
        <p className="subtitle">{t('offerRide.step1.instruction')}</p>
        <div className="map-controls">
          <span>{t('offerRide.step1.currentlySelecting')}: <strong>{t(`offerRide.step1.${selecting}`)}</strong></span>
          <button onClick={resetPoints} className="secondary-button" disabled={isGeocoding}>
            {t('offerRide.step1.resetPoints')}
          </button>
        </div>

        <MapContainer center={[53.2194, 6.5665]} zoom={12} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMapClick={handleMapClick} disabled={selecting === 'done' || isGeocoding} />
          {startPoint && <Marker position={startPoint} icon={startIcon} />}
          {endPoint && <Marker position={endPoint} icon={endIcon} />}
          {startPoint && endPoint && <RoutingMachine start={startPoint} end={endPoint} />}
        </MapContainer>

        <div className="location-summary">
            {startPoint && <p><strong>{t('offerRide.step1.start')}:</strong> {startPoint.name}</p>}
            {endPoint && <p><strong>{t('offerRide.step1.end')}:</strong> {endPoint.name}</p>}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-card">
          <h3>{t('offerRide.step2.title')}</h3>
          <div className="ride-type-selector">
            <button type="button" className={rideType === 'single' ? 'active' : ''} onClick={() => setRideType('single')}>
              {t('offerRide.step2.singleTrip')}
            </button>
            <button type="button" className={rideType === 'recurring' ? 'active' : ''} onClick={() => setRideType('recurring')}>
              {t('offerRide.step2.recurring')}
            </button>
          </div>
        </div>

        <div className="form-card">
          <h3>{t('offerRide.step3.title')}</h3>
          
          {rideType === 'recurring' ? (
            <div className="form-grid">
              <div className="day-selector">
                <label>{t('offerRide.step3.onTheseDays')}:</label>
                <div className="day-buttons">
                  {days.map(day => (
                    <button key={day.value} type="button" className={`day-button ${daysOfWeek.includes(day.value) ? 'active' : ''}`} onClick={() => handleDayToggle(day.value)}>
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="departureTime">{t('offerRide.step3.departureTime')}:</label>
                <input type="time" id="departureTime" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="isReturnRideRecurring" checked={isReturnRideRecurring} onChange={e => setIsReturnRideRecurring(e.target.checked)} />
                <label htmlFor="isReturnRideRecurring">{t('offerRide.step3.includeReturn')}</label>
              </div>
              {isReturnRideRecurring && (
                <div className="form-group">
                  <label htmlFor="returnTimeRecurring">{t('offerRide.step3.returnTime')}:</label>
                  <input type="time" id="returnTimeRecurring" value={returnTimeRecurring} onChange={e => setReturnTimeRecurring(e.target.value)} required />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="start-date">{t('offerRide.step3.startDate')}:</label>
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} min={todayString} required />
              </div>
              <div className="form-group">
                <label htmlFor="end-date">{t('offerRide.step3.endDate')}:</label>
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="singleRideDate">{t('offerRide.step3.departureDatetime')}:</label>
                <input type="datetime-local" id="singleRideDate" value={singleRideDate} onChange={e => setSingleRideDate(e.target.value)} required />
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="isReturnRideSingle" checked={isReturnRideSingle} onChange={e => setIsReturnRideSingle(e.target.checked)} />
                <label htmlFor="isReturnRideSingle">{t('offerRide.step3.includeReturn')}</label>
              </div>
              {isReturnRideSingle && (
                <div className="form-group">
                  <label htmlFor="singleReturnTime">{t('offerRide.step3.returnTime')}:</label>
                  <input type="time" id="singleReturnTime" value={singleReturnTime} onChange={e => setSingleReturnTime(e.target.value)} required />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-card">
          <h3>{t('offerRide.step4.title')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="availableSeats">{t('offerRide.step4.availableSeats')}:</label>
              <input type="number" id="availableSeats" value={availableSeats} onChange={e => setAvailableSeats(e.target.value)} min="1" required />
            </div>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="submit-section">
          <button type="submit" className="primary-button" disabled={isGeocoding || !startPoint || !endPoint}>
            {t('offerRide.createButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferRide;
