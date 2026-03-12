// client/src/hooks/useAddress.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useAddress = (location) => {
  const [address, setAddress] = useState('Loading address...');

  useEffect(() => {
    if (!location?.lat || !location?.lng) {
      setAddress('Invalid location');
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await axios.get(`/api/geocode/reverse?lat=${location.lat}&lon=${location.lng}`);
        setAddress(res.data.display_name || 'Address not found');
      } catch (error) {
        setAddress('Could not fetch address');
      }
    };

    fetchAddress();
  }, [location]);

  return address;
};

export default useAddress;
