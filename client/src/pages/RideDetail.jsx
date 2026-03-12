// client/src/pages/RideDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import L from 'leaflet';
import RoutingMachine from '../components/RoutingMachine';

const parseCoordinates = (coordData) => {
  if (!coordData) return null;

  let parsed;
  try {
    parsed = typeof coordData === 'string' ? JSON.parse(coordData) : coordData;
  } catch (error) {
    console.warn("Coordinate parsing failed:", coordData);
    return null;
  }

  if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
    return [parsed.lat, parsed.lng];
  }
  
  return null;
};

// Custom icons for different marker types
const startIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const endIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const passengerIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const pickupIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const pendingIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

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

const RideDetail = ({ user }) => {
  const { t } = useTranslation(); // NEW: Use translation hook
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRide = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/rides/${rideId}`);
      setRide(res.data);
    } catch (err) {
      setError(t('rideDetail.errors.loadFailed')); // UPDATED: Use translation
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [rideId]);

  const handleRequestSeat = async () => {
    if (!pickupLocation) {
      alert(t('rideDetail.alerts.selectPickup')); // UPDATED: Use translation
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(
        `/api/requests`,
        { rideId: ride.id, pickupLocation: pickupLocation },
        config
      );
      alert(t('rideDetail.alerts.requestSent')); // UPDATED: Use translation
      fetchRide();
      navigate('/dashboard');
    } catch (err) {
      alert(`${t('common.error')}: ${err.response?.data?.message || t('rideDetail.errors.requestFailed')}`); // UPDATED: Use translation
    }
  };

  const handleCancelSeat = async (requestId) => {
    if (window.confirm(t('rideDetail.confirmations.cancelSeat'))) { // UPDATED: Use translation
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/requests/${requestId}/cancel`, {}, {
          headers: { 'x-auth-token': token }
        });
        alert(t('rideDetail.alerts.seatCanceled')); // UPDATED: Use translation
        fetchRide();
      } catch (err) {
        console.error("Failed to cancel seat:", err);
        alert(err.response?.data?.msg || t('rideDetail.errors.cancelSeatFailed')); // UPDATED: Use translation
      }
    }
  };

  const handleCancelRide = async () => {
    if (window.confirm(t('rideDetail.confirmations.cancelRide'))) { // UPDATED: Use translation
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/rides/${rideId}/cancel`, {}, {
          headers: { 'x-auth-token': token }
        });
        alert(t('rideDetail.alerts.rideCanceled')); // UPDATED: Use translation
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to cancel ride:", err);
        alert(err.response?.data?.msg || t('rideDetail.errors.cancelRideFailed')); // UPDATED: Use translation
      }
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`/api/requests/${requestId}/update`, { status }, config);
      fetchRide(); 
    } catch (err) {
      alert(`${t('common.error')}: ${err.response?.data?.message || t('rideDetail.errors.updateFailed')}`); // UPDATED: Use translation
    }
  };

  if (loading) return <p>{t('rideDetail.loading')}</p>; // UPDATED: Use translation
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!ride) return <p>{t('rideDetail.errors.noData')}</p>; // UPDATED: Use translation

  let startCoords = null;
  let endCoords = null;
  let startName = t('rideDetail.startLocation'); // UPDATED: Use translation
  let endName = t('rideDetail.endLocation'); // UPDATED: Use translation

  try {
    const start = typeof ride.startPoint === 'string' ? JSON.parse(ride.startPoint) : ride.startPoint;
    if (start && typeof start.lat === 'number' && typeof start.lng === 'number') {
      startCoords = [start.lat, start.lng];
      startName = start.name || startName;
    }
  } catch (e) {
    console.error("Error parsing startPoint:", e);
  }

  try {
    const end = typeof ride.endPoint === 'string' ? JSON.parse(ride.endPoint) : ride.endPoint;
    if (end && typeof end.lat === 'number' && typeof end.lng === 'number') {
      endCoords = [end.lat, end.lng];
      endName = end.name || endName;
    }
  } catch (e) {
    console.error("Error parsing endPoint:", e);
  }

  const isDriver = user && user.id === ride.driver.id; 
  const existingRequest = user ? (ride.requests || []).find(req => req.passengerId === user.id) : null;
  const acceptedPassengers = (ride.requests || []).filter( req => req.status && req.status.trim().toLowerCase() === 'accepted');
  const pendingRequests = (ride.requests || []).filter(req => req.status && req.status.trim().toLowerCase() === 'pending');
  const currentUserRequest = acceptedPassengers.find(req => String(req.passengerId) === String(user?.id));

  return (
    <div className="ride-detail-container" style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2>{t('rideDetail.title')} <Link to={`/users/${ride.driver.id}`}>{ride.driver.name}</Link></h2>
      <p><strong>{t('rideDetail.departure')}:</strong> {formatDateTime(ride.departureTime)}</p>

      <div className="location-info" style={{background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>
        <p><strong>{t('rideDetail.from')}:</strong> {startName}</p>
        <p><strong>{t('rideDetail.to')}:</strong> {endName}</p>
      </div>

      {currentUserRequest && (
        <button 
          onClick={() => handleCancelSeat(currentUserRequest.id)} 
          className="cancel-button" 
          style={{ backgroundColor: '#dc3545', color: 'white', marginBottom: '15px', padding: '10px' }}
        >
          {t('rideDetail.cancelMySeat')}
        </button>
      )}

      {isDriver && (
        <button 
          onClick={handleCancelRide} 
          className="cancel-ride-button" 
          style={{ backgroundColor: '#c82333', color: 'white', marginBottom: '15px', padding: '10px', border: 'none', cursor: 'pointer' }}
        >
          {t('rideDetail.cancelThisRide')}
        </button>
      )}
      
      {startCoords && endCoords ? (
        <MapContainer center={startCoords} zoom={11} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '20px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <RoutingMachine start={startCoords} end={endCoords} />
          
          <Marker position={startCoords} icon={startIcon}>
            <Popup>{startName}</Popup>
          </Marker>
          <Marker position={endCoords} icon={endIcon}>
            <Popup>{endName}</Popup>
          </Marker>

          {acceptedPassengers.map(req => {
            const passengerCoords = parseCoordinates(req.pickupLocation);
            if (!passengerCoords) {
              console.warn("Skipping marker for a passenger due to invalid coordinates:", req);
              return null; 
            }
            return (
              <Marker key={req.id} position={passengerCoords} icon={passengerIcon}>
                <Popup>
                  {t('rideDetail.passenger')}: <Link to={`/users/${req.passenger.id}`}>{req.passenger.name}</Link>
                </Popup>
              </Marker>
            );
          })}

          {isDriver && pendingRequests.map(req => {
            const passengerCoords = parseCoordinates(req.pickupLocation);
            if (!passengerCoords) return null;
            return (
              <Marker key={`pending-${req.id}`} position={passengerCoords} icon={pendingIcon}>
                <Popup>
                  {t('rideDetail.pendingFrom')}: {req.passenger.name}
                  <br/>
                  <button onClick={() => handleUpdateRequest(req.id, 'accepted')}>{t('rideDetail.accept')}</button>
                  <button onClick={() => handleUpdateRequest(req.id, 'refused')}>{t('rideDetail.decline')}</button>
                </Popup>
              </Marker>
            );
          })}

          {existingRequest && parseCoordinates(existingRequest.pickupLocation) && (
            <Marker position={parseCoordinates(existingRequest.pickupLocation)} icon={pickupIcon}>
              <Popup>{t('rideDetail.yourPickup')}</Popup>
            </Marker>
          )}

          {!isDriver && !existingRequest && <MapClickHandler onMapClick={setPickupLocation} />}
          {pickupLocation && !existingRequest && (
            <Marker position={pickupLocation} icon={pickupIcon}>
              <Popup>{t('rideDetail.selectedPickup')}</Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <p>{t('rideDetail.mapUnavailable')}</p>
      )}

      <div className="details-panel-ui" style={{ marginTop: '20px' }}>
        {isDriver ? (
          <div>
            <h3>{t('rideDetail.manifest.title')}</h3>
            <p><strong>{t('rideDetail.manifest.seatsLeft')}:</strong> {ride.availableSeats}</p>
            <h4>{t('rideDetail.manifest.acceptedPassengers')}:</h4>
            {acceptedPassengers.length > 0 ? (
              <ul>{acceptedPassengers.map(p => <li key={p.id}>{p.passenger.name}</li>)}</ul>
            ) : <p>{t('rideDetail.manifest.noPassengers')}</p>}
          </div>
        ) : existingRequest ? (
          <div>
            <h3>{t('rideDetail.requestStatus.title')}</h3>
            <p>{t('rideDetail.requestStatus.current')}: <strong>{existingRequest.status}</strong></p>
          </div>
        ) : (
          <div>
            <h4>{t('rideDetail.requestSeat.title')}</h4>
            <p>{t('rideDetail.requestSeat.instruction')}</p>
            <button onClick={handleRequestSeat} disabled={!pickupLocation || ride.availableSeats === 0}>
              {ride.availableSeats > 0 ? t('rideDetail.requestSeat.confirm') : t('rideDetail.requestSeat.full')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideDetail;
