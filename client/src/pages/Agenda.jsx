// client/src/pages/AgendaPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next'; // NEW: Import translation hook
import AddressFromCoords from '../components/AddressFromCoords';
import './Agenda.css';

// Helper function to easily parse URL query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Agenda = () => {
    const { t } = useTranslation(); // NEW: Use translation hook
    const query = useQuery();
    const dateFromUrl = query.get('date') || '';

    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        date: dateFromUrl,
        startLocation: '',
        endLocation: ''
    });

    const formatDateTime = (dateTimeInput) => {
        // Handle if input is undefined or null
        if (!dateTimeInput) return 'N/A';
        
        // If it's already a Date object, convert to string first
        let dateTimeString;
        if (dateTimeInput instanceof Date) {
            // Extract components from Date object
            const year = dateTimeInput.getFullYear();
            const month = String(dateTimeInput.getMonth() + 1).padStart(2, '0');
            const day = String(dateTimeInput.getDate()).padStart(2, '0');
            const hour = String(dateTimeInput.getHours()).padStart(2, '0');
            const minute = String(dateTimeInput.getMinutes()).padStart(2, '0');
            dateTimeString = `${year}-${month}-${day} ${hour}:${minute}:00`;
        } else {
            dateTimeString = String(dateTimeInput);
        }
        
        // Parse the datetime string without timezone conversion
        const cleanString = dateTimeString.replace('T', ' ').substring(0, 19);
        const [datePart, timePart] = cleanString.split(' ');
        
        // Safety check
        if (!datePart || !timePart) return dateTimeString;
        
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        
        // Create date object from individual parts
        const date = new Date(year, month - 1, day, hour, minute);
        
        const dayName = format(date, 'EEE');
        const monthName = format(date, 'MMM');
        const dayNum = format(date, 'd');
        const yearNum = format(date, 'yyyy');
        
        // Convert to 12-hour format
        let hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        hourNum = hourNum % 12 || 12;
        
        return `${dayName}, ${monthName} ${dayNum}, ${yearNum} @ ${hourNum}:${minute} ${ampm}`;
        };

    useEffect(() => {
        const fetchRides = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                const params = new URLSearchParams();
                if (filters.date) params.append('date', filters.date);
                if (filters.startLocation) params.append('startLocation', filters.startLocation);
                if (filters.endLocation) params.append('endLocation', filters.endLocation);

                const res = await axios.get(`/api/rides?${params.toString()}`, {
                    headers: { 'x-auth-token': token }
                });

                setRides(res.data);
            } catch (err) {
                console.error("Failed to fetch rides:", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchRides();
        }, 300);

        return () => clearTimeout(timer);

    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ date: '', startLocation: '', endLocation: '' });
    };

    return (
        <div className="agenda-container">
            <h1>{t('agenda.title')}</h1>

            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="startLocation">{t('agenda.from')}</label>
                    <input
                        type="text"
                        name="startLocation"
                        placeholder={t('agenda.placeholders.from')}
                        value={filters.startLocation}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="endLocation">{t('agenda.to')}</label>
                    <input
                        type="text"
                        name="endLocation"
                        placeholder={t('agenda.placeholders.to')}
                        value={filters.endLocation}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="date">{t('agenda.filterByDate')}</label>
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                    />
                </div>
                <button onClick={clearFilters} className="clear-filters-btn">
                    {t('agenda.clearFilters')}
                </button>
            </div>

            <div className="rides-list">
                {loading ? (
                    <p>{t('agenda.searching')}</p>
                ) : rides.length > 0 ? (
                    rides.map(ride => {
                        let startPoint, endPoint;
                        try { startPoint = JSON.parse(ride.startPoint); } catch { startPoint = null; }
                        try { endPoint = JSON.parse(ride.endPoint); } catch { endPoint = null; }

                        return (
                            <div key={ride.id} className="ride-card">
                                <div className="ride-card-header">
                                    <p><strong>{t('agenda.from')}:</strong> {startPoint ? <AddressFromCoords lat={startPoint.lat} lng={startPoint.lng} /> : t('agenda.notSpecified')}</p>
                                    <p><strong>{t('agenda.to')}:</strong> {endPoint ? <AddressFromCoords lat={endPoint.lat} lng={endPoint.lng} /> : t('agenda.notSpecified')}</p>
                                </div>
                                <div className="ride-card-body">
                                    <p><strong>{t('agenda.departure')}:</strong> {formatDateTime(ride.departureTime)}</p>
                                    <p><strong>{t('agenda.availableSeats')}:</strong> {ride.availableSeats ?? '—'}</p>
                                    <p><strong>{t('agenda.driver')}:</strong> {ride && ride.driver ? ride.driver.name : '—'}</p>
                                </div>
                                <div className="ride-card-footer">
                                    <Link to={`/ride/${ride.id}`} className="view-details-btn">
                                        {t('agenda.viewDetails')}
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>{t('agenda.noRidesFound')}</p>
                )}
            </div>
        </div>
    );
};

export default Agenda;
