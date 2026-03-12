// server/index.js
const express = require('express');
const app = express();

const cors = require('cors');
const path = require('path');
const db = require('./models');

require('dotenv').config();
const { sequelize } = require('./models');
const { scheduleRideGeneration } = require('./services/rideScheduler');

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploads folder for avatars and other user uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve the public folder (if you have one)
app.use(express.static(path.join(__dirname, 'public')));

// Serve React build files
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Sync database
db.sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// --- API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/geocode', require('./routes/geocoding'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/recurring-rides', require('./routes/recurringRides'));
app.use('/api/bulk-users', require('./routes/bulkUsers'));
app.use('/api/contact', require('./routes/contact'));

// Use a regular expression to match all non-API routes.
// This is the most compatible way to write a catch-all route.
// This sends all non-API, non-static-file requests to React
app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  
  scheduleRideGeneration();
});
