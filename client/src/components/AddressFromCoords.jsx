// client/src/components/AddressFromCoords.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// the key you got from Geoapify
const API_KEY = 'bf814e88d83e428296bea24ca521aaac';

const AddressFromCoords = ({ lat, lng }) => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lat || !lng || !API_KEY) {
            setAddress('Invalid coordinates');
            setLoading(false);
            return;
        }

        const fetchAddress = async () => {
            setLoading(true);
            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${API_KEY}`;
            
            try {
                const res = await axios.get(url);
                if (res.data.features.length > 0) {
                    // Use the formatted address provided by the API
                    setAddress(res.data.features[0].properties.formatted);
                } else {
                    setAddress('Address not found');
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error);
                setAddress('Could not fetch address');
            } finally {
                setLoading(false);
            }
        };

        fetchAddress();
    }, [lat, lng]); // Re-run effect if coordinates change

    if (loading) {
        return <span>Loading address...</span>;
    }

    return <span>{address}</span>;
};

export default AddressFromCoords;
