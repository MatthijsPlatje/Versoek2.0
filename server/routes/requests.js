// server/routes/requests.js

const express = require('express');
const router = express.Router();
const { RideRequest, Ride, User, Notification } = require('../models');
const authMiddleware = require('../middleware/auth');
const { sendEmail, createCalendarEvent } = require('../services/emailService'); // NEW: Import email service

// POST a new ride request
router.post('/', authMiddleware, async (req, res) => {
    const { rideId, pickupLocation } = req.body;
    const passengerId = req.user.id;

    try {
        const ride = await Ride.findByPk(rideId, {
            include: { model: User, as: 'driver', attributes: ['name', 'email'] } // NEW: Include driver email
        });
        
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }
        if (ride.driverId === passengerId) {
            return res.status(400).json({ message: 'You cannot request a seat on your own ride.' });
        }
        if (ride.availableSeats < 1) {
            return res.status(400).json({ message: 'This ride is full.' });
        }

        const newRequest = await RideRequest.create({
            rideId,
            passengerId,
            pickupLocation,
            status: 'pending',
        });

        const passenger = await User.findByPk(passengerId);
        
        // Create notification for driver
        await Notification.create({
            userId: ride.driverId,
            message: `${passenger.name} has requested a seat on your ride.`,
            rideId: ride.id,
        });

        // NEW: Send email to driver
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

        await sendEmail({
            to: ride.driver.email,
            subject: 'New Ride Request - Action Required',
            text: `Hello ${ride.driver.name},\n\n${passenger.name} has requested a seat on your ride scheduled for ${rideDate} at ${rideTime}.\n\nPickup Location: ${pickupLocation}\n\nPlease log in to your dashboard to accept or decline this request.\n\nBest regards,\nCorporate Carpooling Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">New Ride Request</h2>
                    <p>Hello <strong>${ride.driver.name}</strong>,</p>
                    <p><strong>${passenger.name}</strong> has requested a seat on your ride.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${rideDate}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${rideTime}</p>
                        <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${pickupLocation}</p>
                    </div>
                    <p>Please log in to your dashboard to accept or decline this request.</p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
                </div>
            `
        });

        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating ride request:", error);
        res.status(500).json({ message: 'Failed to create ride request.' });
    }
});

// PUT /api/requests/:id - A driver accepts or refuses a request
router.post('/:id/update', authMiddleware, async (req, res) => {
    const { status } = req.body; // 'accepted' or 'refused'
    
    try {
        // Find the request and include the ride and driver's info
        const request = await RideRequest.findByPk(req.params.id, {
            include: {
                model: Ride,
                as: 'Ride',
                include: { model: User, as: 'driver', attributes: ['name', 'email'] }
            }
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // Authorization: Only the driver of the ride can update the request
        if (req.user.id !== request.Ride.driverId) {
            return res.status(403).json({ message: 'User not authorized.' });
        }

        // Update the request status
        request.status = status;
        await request.save();

        // Get passenger information with email FIRST (MOVED UP)
        const passenger = await User.findByPk(request.passengerId, {
            attributes: ['name', 'email']
        });

        // If request is accepted, decrement available seats
        if (status === 'accepted') {
            const ride = await Ride.findByPk(request.rideId);
            if (ride.availableSeats > 0) {
                ride.availableSeats -= 1;
                await ride.save();
            }

            // Create calendar event for passenger
            const calendarEvent = createCalendarEvent({
            departureTime: request.Ride.departureTime,
            startPoint: request.Ride.startPoint,
            endPoint: request.Ride.endPoint,
            driverName: request.Ride.driver.name,
            rideId: request.Ride.id
            }, 'create');

            // Send email to passenger
            const rideDate = new Date(request.Ride.departureTime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const rideTime = new Date(request.Ride.departureTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const emailSubject = 'Ride Request Accepted - You\'re All Set!';

            await sendEmail({
            to: passenger.email,
            subject: emailSubject,
            text: `Hello ${passenger.name},\n\nYour request for the ride with ${request.Ride.driver.name} on ${rideDate} at ${rideTime} has been accepted.\n\nSee you on the ride!\n\nBest regards,\nCorporate Carpooling Team`,
            html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #27ae60;">Ride Request Accepted</h2>
                            <p>Hello <strong>${passenger.name}</strong>,</p>
                            <p>Your request for the ride with <strong>${request.Ride.driver.name}</strong> has been <strong style="color: #27ae60;">accepted</strong>.</p>
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${rideDate}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${rideTime}</p>
                            </div>
                            <p style="color: #27ae60;">See you on the ride!</p>
                            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
                        </div>
                    `,
            calendarEvent: calendarEvent
            });
        }

        // Handle rejection email (if needed)
        if (status === 'refused') {
            const rideDate = new Date(request.Ride.departureTime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const rideTime = new Date(request.Ride.departureTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            await sendEmail({
                to: passenger.email,
                subject: 'Ride Request Update',
                text: `Hello ${passenger.name},\n\nYour request for the ride with ${request.Ride.driver.name} on ${rideDate} at ${rideTime} has been declined.\n\nPlease browse other available rides on the platform.\n\nBest regards,\nCorporate Carpooling Team`,
                html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #e74c3c;">Ride Request Declined</h2>
                            <p>Hello <strong>${passenger.name}</strong>,</p>
                            <p>Your request for the ride with <strong>${request.Ride.driver.name}</strong> has been <strong style="color: #e74c3c;">declined</strong>.</p>
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${rideDate}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${rideTime}</p>
                            </div>
                            <p>Please browse other available rides on the platform.</p>
                            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
                        </div>
                    `
            });
        }

        // Create notification for the passenger
        await Notification.create({
            userId: request.passengerId,
            message: `Your request for the ride with ${request.Ride.driver.name} has been ${status}.`,
            rideId: request.rideId,
        });

        res.json(request);

    } catch (error) {
        console.error('Error updating ride request:', error);
        res.status(500).json({ message: 'Failed to update ride request.' });
    }
});

// DELETE api/requests/:id - Passenger cancels their ride request
router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const request = await RideRequest.findByPk(req.params.id, {
            include: {
                model: Ride,
                include: { model: User, as: 'driver', attributes: ['name', 'email'] } // Include driver email
            }
        });

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (String(request.passengerId) !== String(req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // NEW: Get passenger info for email
        const passenger = await User.findByPk(req.user.id, {
            attributes: ['name']
        });

        // Create notification for driver
        if (request.Ride && request.Ride.driverId) {
            const rideDate = new Date(request.Ride.departureTime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            await Notification.create({
                userId: request.Ride.driverId,
                message: `A passenger has canceled their seat for your ride on ${rideDate}.`,
                rideId: request.rideId,
                isRead: false
            });

            // Send email to driver
            const rideTime = new Date(request.Ride.departureTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            await sendEmail({
                to: request.Ride.driver.email,
                subject: 'Ride Request Cancelled',
                text: `Hello ${request.Ride.driver.name},\n\n${passenger.name} has cancelled their seat request for your ride on ${rideDate} at ${rideTime}.\n\nA seat is now available again for other passengers.\n\nBest regards,\nCorporate Carpooling Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #e74c3c;">Ride Request Cancelled</h2>
                        <p>Hello <strong>${request.Ride.driver.name}</strong>,</p>
                        <p><strong>${passenger.name}</strong> has cancelled their seat request for your ride.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${rideDate}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${rideTime}</p>
                        </div>
                        <p>A seat is now available again for other passengers.</p>
                        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
                    </div>
                `
            });
        } else {
            console.warn(`Could not find associated ride for request ID ${request.id} to notify the driver.`);
        }
        
        await request.destroy();

        res.json({ msg: 'Ride request successfully canceled.' });

        // After deleting the request, send cancellation to passenger:
        const passengerEmail = await User.findByPk(req.user.id, {
          attributes: ['email']
        });

        const cancellationEvent = createCalendarEvent({
          departureTime: request.Ride.departureTime,
          startPoint: request.Ride.startPoint,
          endPoint: request.Ride.endPoint,
          driverName: request.Ride.driver.name,
          rideId: request.rideId
        }, 'cancel');

        await sendEmail({
          to: passengerEmail.email,
          subject: 'Ride Request Cancelled',
          text: 'Your ride request has been cancelled and removed from your calendar.',
          html: '<p>Your ride request has been cancelled and removed from your calendar.</p>',
          calendarEvent: cancellationEvent
        });
    } catch (err) {
        console.error('ERROR during request cancellation:', err); 
        res.status(500).send('Server Error');
    }
});

// GET /api/requests/received - Get requests for rides I'm driving
router.get('/received', authMiddleware, async (req, res) => {
  try {
    const requests = await RideRequest.findAll({
      include: [
        {
          model: Ride,
          as: 'Ride',
          where: { driverId: req.user.id },
          include: [
            { model: User, as: 'driver', attributes: ['id', 'name'] }
          ]
        },
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching received requests:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/requests/sent - Get requests I've made as a passenger
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const requests = await RideRequest.findAll({
      where: { passengerId: req.user.id },
      include: [
        {
          model: Ride,
          as: 'Ride',
          include: [
            { model: User, as: 'driver', attributes: ['id', 'name'] }
          ]
        },
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching sent requests:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
