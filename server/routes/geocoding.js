// server/routes/geocoding.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/reverse', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await axios.get(url, {
      headers: {
        // IMPORTANT: Nominatim requires a custom User-Agent header.
        'User-Agent': 'CarpoolingApp/1.0 (info@teledo.eu)' 
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Nominatim API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch address from geocoding service.' });
  }
});

module.exports = router;
