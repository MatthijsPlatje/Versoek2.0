// server/routes/rides.js

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); 
const { Ride, User, RideRequest, Notification, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');
const { sendEmail, createCalendarEvent } = require('../services/emailService'); // Updated import

// POST /api/rides - Create a new ride (Protected)
router.post('/', authMiddleware, async (req, res) => {  
  const { startPoint, endPoint, departureTime, availableSeats, returnTime } = req.body;
  
  if (!startPoint || !endPoint || !departureTime || !availableSeats) {
    return res.status(400).json({ message: 'Missing required ride information.' });
  }

  const transaction = await sequelize.transaction();

  try {
    // Get driver information for confirmation email
    const driver = await User.findByPk(req.user.id, {
      attributes: ['name', 'email']
    });

    // 1. Create the outbound ride using raw SQL to avoid timezone conversion
    const [outboundResult] = await sequelize.query(
      `INSERT INTO rides (driver_id, start_point, end_point, departure_time, available_seats, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          req.user.id,
          startPoint,
          endPoint,
          departureTime,  // Store exactly as sent from frontend
          availableSeats
        ],
        type: sequelize.QueryTypes.INSERT,
        transaction
      }
    );

    const outboundRideId = outboundResult;
    let returnRideId = null;

    // 2. Check if a 'returnTime' was provided
    if (returnTime) {
      // Extract date from departureTime string: "2025-10-21 09:00:00"
      const dateOnly = departureTime.substring(0, 10); // "2025-10-21"
      const returnDepartureTimeString = `${dateOnly} ${returnTime}:00`;

      // Create the return ride with swapped start/end points
      const [returnResult] = await sequelize.query(
        `INSERT INTO rides (driver_id, start_point, end_point, departure_time, available_seats, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            req.user.id,
            endPoint,  // Swapped
            startPoint,  // Swapped
            returnDepartureTimeString,  // Store exactly as constructed
            availableSeats
          ],
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      returnRideId = returnResult;
    }

    await transaction.commit();

    // Format times for email WITHOUT timezone conversion
    const formatDateTime = (dateTimeString) => {
      const [datePart, timePart] = dateTimeString.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      const date = new Date(year, month - 1, day);
      const dateFormatted = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return {
        date: dateFormatted,
        time: `${hour}:${minute}`
      };
    };

    const outboundFormatted = formatDateTime(departureTime);

    // Parse locations
    const start = typeof startPoint === 'string' ? JSON.parse(startPoint) : startPoint;
    const end = typeof endPoint === 'string' ? JSON.parse(endPoint) : endPoint;

    let emailSubject = 'Ride Created Successfully';
    let emailText = `Hello ${driver.name},\n\nYour ride has been created successfully!\n\n`;
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Ride Created Successfully!</h2>
        <p>Hello <strong>${driver.name}</strong>,</p>
        <p>Your ride has been created and is now visible to all employees.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Outbound Ride</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${outboundFormatted.date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${outboundFormatted.time}</p>
          <p style="margin: 5px 0;"><strong>From:</strong> ${start.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>To:</strong> ${end.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>Available Seats:</strong> ${availableSeats}</p>
        </div>
    `;

    emailText += `Outbound Ride:\nDate: ${outboundFormatted.date}\nTime: ${outboundFormatted.time}\nFrom: ${start.address || 'Selected location'}\nTo: ${end.address || 'Selected location'}\nAvailable Seats: ${availableSeats}\n\n`;

    if (returnTime) {
      const returnDepartureTimeString = `${departureTime.substring(0, 10)} ${returnTime}:00`;
      const returnFormatted = formatDateTime(returnDepartureTimeString);

      emailHtml += `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Return Ride</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${returnFormatted.date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${returnFormatted.time}</p>
          <p style="margin: 5px 0;"><strong>From:</strong> ${end.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>To:</strong> ${start.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>Available Seats:</strong> ${availableSeats}</p>
        </div>
      `;

      emailText += `Return Ride:\nDate: ${returnFormatted.date}\nTime: ${returnFormatted.time}\nFrom: ${end.address || 'Selected location'}\nTo: ${start.address || 'Selected location'}\nAvailable Seats: ${availableSeats}\n\n`;
    }

    emailHtml += `
        <p>You will receive notifications when employees request to join your ride.</p>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
      </div>
    `;

    emailText += `You will receive notifications when employees request to join your ride.\n\nBest regards,\nCorporate Carpooling Team`;

    const calendarEvent = createCalendarEvent({
      departureTime: departureTime,
      startPoint: startPoint,
      endPoint: endPoint,
      driverName: driver.name,
      rideId: outboundRideId
    }, 'create');

    await sendEmail({
      to: driver.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      calendarEvent: calendarEvent
    });

    res.status(201).json({ message: 'Ride(s) created successfully.' });

  } catch (err) {
    await transaction.rollback();
    console.error("Failed to create single ride(s):", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// GET /api/rides/available - Get all available rides for a given month, excluding user's own rides
router.get('/available', authMiddleware, async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user.id;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year query parameters are required.' });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  try {
    const availableRides = await Ride.findAll({
      where: {
        departureTime: {
          [Op.between]: [startDate, endDate],
        },
        driverId: {
          [Op.not]: userId,
        },
      },
      include: {
        model: User,
        as: 'driver',
        attributes: ['id', 'name'],
      },
      order: [['departureTime', 'ASC']],
    });

    res.json(availableRides);
  } catch (error) {
    console.error('Error fetching available rides:', error);
    res.status(500).json({ message: 'Failed to fetch available rides.' });
  }
});

// GET /api/rides/my-rides - Get user's own rides (as driver and passenger)
router.get('/my-rides', authMiddleware, async (req, res) => {
  try {
    const { asDriver, asPassenger } = req.query;

    if (asDriver === 'true') {
      // Get rides where user is the driver
      const rides = await Ride.findAll({
        where: { driverId: req.user.id },
        include: [
          { model: User, as: 'driver', attributes: ['id', 'name', 'email'] },
          {
            model: RideRequest,
            as: 'requests',
            include: [{ model: User, as: 'passenger', attributes: ['id', 'name'] }]
          }
        ],
        order: [['departureTime', 'DESC']]
      });
      return res.json(rides);
    }

    if (asPassenger === 'true') {
      // Get rides where user has a request (accepted, pending, or refused)
      const rides = await Ride.findAll({
        include: [
          { model: User, as: 'driver', attributes: ['id', 'name', 'email'] },
          {
            model: RideRequest,
            as: 'requests',
            where: { passengerId: req.user.id },
            required: true,
            include: [{ model: User, as: 'passenger', attributes: ['id', 'name'] }]
          }
        ],
        order: [['departureTime', 'DESC']]
      });

      // Add myRequest field for easy access
      const ridesWithMyRequest = rides.map(ride => {
        const rideJson = ride.toJSON();
        rideJson.myRequest = rideJson.requests.find(r => r.passengerId === req.user.id);
        return rideJson;
      });

      return res.json(ridesWithMyRequest);
    }

    // If no filter specified, return empty array
    res.json([]);
  } catch (err) {
    console.error('Error fetching my rides:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/rides - Get all available rides (or by date)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, startLocation, endLocation } = req.query;

    const whereClause = {
      departureTime: {
        [Op.gt]: new Date()
      },
      availableSeats: {
        [Op.gt]: 0
      }
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      whereClause.departureTime = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (startLocation) {
      whereClause.startPoint = {
        [Op.like]: `%${startLocation}%`
      };
    }

    if (endLocation) {
      whereClause.endPoint = {
        [Op.like]: `%${endLocation}%`
      };
    }

    const rides = await Ride.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'driver', attributes: ['id', 'name'] },
        { model: RideRequest, as: 'requests' } 
      ],
      order: [['departureTime', 'ASC']]
    });

    const filteredRides = rides.filter(ride => {
        const isDriver = ride.driverId === req.user.id;
        const isPassenger = ride.requests.some(request => request.userId === req.user.id); 
        return !isDriver && !isPassenger;
    });

    res.json(filteredRides);
  } catch (err) {
    console.error("Error fetching rides:", err.message); 
    res.status(500).send('Server Error');
  }
});

// GET /api/rides/:id - Get a single ride by its ID
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name'],
        },
        { 
          model: RideRequest,
          as: 'requests',
          attributes: ['id', 'status', 'passengerId', 'pickupLocation'], 
          include: { 
            model: User, 
            as: 'passenger', 
            attributes: ['id', 'name', ]
          },
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found.' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error fetching single ride:', error);
    res.status(500).json({ message: 'Failed to fetch ride.' });
  }
});

// DELETE api/rides/:id - Driver cancels a ride
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  const t = await sequelize.transaction(); 

  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        { 
          model: RideRequest, 
          as: 'requests',
          include: {
            model: User,
            as: 'passenger',
            attributes: ['id', 'name', 'email'] // NEW: Include passenger email
          }
        }
      ],
      transaction: t
    });

    if (!ride) {
      await t.rollback();
      return res.status(404).json({ msg: 'Ride not found' });
    }

    if (ride.driverId !== req.user.id) {
      await t.rollback();
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // NEW: Prepare email data
    const rideDate = new Date(ride.departureTime).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const rideTime = new Date(ride.departureTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Parse ride locations
    const start = typeof ride.startPoint === 'string' ? JSON.parse(ride.startPoint) : ride.startPoint;
    const end = typeof ride.endPoint === 'string' ? JSON.parse(ride.endPoint) : ride.endPoint;

    if (ride.requests && ride.requests.length > 0) {
      const notificationPromises = ride.requests.map(request =>
        Notification.create({
          userId: request.passengerId,
          message: `The ride scheduled for ${rideDate} has been canceled by the driver.`,
          rideId: ride.id,
          isRead: false
        }, { transaction: t })
      );
      await Promise.all(notificationPromises);

      // NEW: Send email to all passengers
      const emailPromises = ride.requests
        .filter(request => request.passenger && request.passenger.email)
        .map(request => {
          const cancellationEvent = createCalendarEvent({
            departureTime: ride.departureTime,
            startPoint: ride.startPoint,
            endPoint: ride.endPoint,
            driverName: 'Driver',
            rideId: ride.id
          }, 'cancel'); // Use 'cancel' type
          
          return sendEmail({
            to: request.passenger.email,
            subject: 'Ride Cancelled',
            text: `Hello ${request.passenger.name},\n\nUnfortunately, the ride you were booked on has been cancelled by the driver.\n\nRide Details:\nDate: ${rideDate}\nTime: ${rideTime}\nFrom: ${start.address || 'Selected location'}\nTo: ${end.address || 'Selected location'}\n\nPlease browse the platform for alternative rides.\n\nBest regards,\nCorporate Carpooling Team`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">Ride Cancelled</h2>
                <p>Hello <strong>${request.passenger.name}</strong>,</p>
                <p>Unfortunately, the ride you were booked on has been <strong style="color: #e74c3c;">cancelled</strong> by the driver.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${rideDate}</p>
                  <p style="margin: 5px 0;"><strong>Time:</strong> ${rideTime}</p>
                  <p style="margin: 5px 0;"><strong>From:</strong> ${start.address || 'Selected location'}</p>
                  <p style="margin: 5px 0;"><strong>To:</strong> ${end.address || 'Selected location'}</p>
                </div>
                <p>Please browse the platform for alternative rides.</p>
                <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
              </div>
            `,
            calendarEvent: cancellationEvent
          });
        });

      // Execute all email sends (don't wait for them to complete the transaction)
      Promise.all(emailPromises).catch(err => {
        console.error('Error sending cancellation emails:', err);
      });
    }
    
    await RideRequest.destroy({ where: { rideId: ride.id }, transaction: t });
    
    await ride.destroy({ transaction: t });

    await t.commit();
    res.json({ msg: 'Ride and all associated requests have been canceled.' });

  } catch (err) {
    await t.rollback();
    console.error('ERROR during ride cancellation:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
