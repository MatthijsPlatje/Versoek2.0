// /server/routes/recurringRides.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { RecurringRide, User } = require('../models');
const { generateRidesFromRules } = require('../services/rideScheduler');
const { sendEmail } = require('../services/emailService');

// GET route
router.get('/', auth, async (req, res) => {
  try {
    const recurringRides = await RecurringRide.findAll({
      where: {
        driverId: req.user.id 
      }
    });
    res.json(recurringRides);
  } catch (err) {
    console.error('Error fetching recurring rides:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST route
router.post('/', auth, async (req, res) => {
  const { startPoint, endPoint, daysOfWeek, departureTime, returnTime, seats, startDate, endDate } = req.body;
  
  try {
    const driver = await User.findByPk(req.user.id, {
      attributes: ['name', 'email']
    });

    const commonData = {
      driverId: req.user.id,
      daysOfWeek,
      seats: seats,
      startDate,
      endDate: endDate || null,
    };

    await RecurringRide.create({
      ...commonData,
      startPoint,
      endPoint,
      departureTime,
    });

    if (returnTime) {
      await RecurringRide.create({
        ...commonData,
        startPoint: endPoint,
        endPoint: startPoint,
        departureTime: returnTime,
      });
    }

    generateRidesFromRules().catch(err => {
      console.error('Error during immediate background ride generation:', err);
    });

    // NEW: Send confirmation email
    const start = typeof startPoint === 'string' ? JSON.parse(startPoint) : startPoint;
    const end = typeof endPoint === 'string' ? JSON.parse(endPoint) : endPoint;

    // Format days of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');

    // Format dates
    const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedEndDate = endDate 
      ? new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No end date';

    let emailSubject = 'Recurring Ride Created Successfully';
    let emailText = `Hello ${driver.name},\n\nYour recurring ride schedule has been created successfully!\n\n`;
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Recurring Ride Created Successfully!</h2>
        <p>Hello <strong>${driver.name}</strong>,</p>
        <p>Your recurring ride schedule has been created and individual rides will be automatically generated each week.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Outbound Schedule</h3>
          <p style="margin: 5px 0;"><strong>Days:</strong> ${selectedDays}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${departureTime}</p>
          <p style="margin: 5px 0;"><strong>From:</strong> ${start.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>To:</strong> ${end.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>Available Seats:</strong> ${seats}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${formattedStartDate}</p>
          <p style="margin: 5px 0;"><strong>End Date:</strong> ${formattedEndDate}</p>
        </div>
    `;

    emailText += `Outbound Schedule:\nDays: ${selectedDays}\nTime: ${departureTime}\nFrom: ${start.address || 'Selected location'}\nTo: ${end.address || 'Selected location'}\nAvailable Seats: ${seats}\nStart Date: ${formattedStartDate}\nEnd Date: ${formattedEndDate}\n\n`;

    if (returnTime) {
      emailHtml += `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Return Schedule</h3>
          <p style="margin: 5px 0;"><strong>Days:</strong> ${selectedDays}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${returnTime}</p>
          <p style="margin: 5px 0;"><strong>From:</strong> ${end.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>To:</strong> ${start.address || 'Selected location'}</p>
          <p style="margin: 5px 0;"><strong>Available Seats:</strong> ${seats}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${formattedStartDate}</p>
          <p style="margin: 5px 0;"><strong>End Date:</strong> ${formattedEndDate}</p>
        </div>
      `;

      emailText += `Return Schedule:\nDays: ${selectedDays}\nTime: ${returnTime}\nFrom: ${end.address || 'Selected location'}\nTo: ${start.address || 'Selected location'}\nAvailable Seats: ${seats}\nStart Date: ${formattedStartDate}\nEnd Date: ${formattedEndDate}\n\n`;
    }

    emailHtml += `
        <p>Individual rides will appear on your calendar and be available for booking by other employees.</p>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>Corporate Carpooling Team</p>
      </div>
    `;

    emailText += `Individual rides will appear on your calendar and be available for booking by other employees.\n\nBest regards,\nCorporate Carpooling Team`;

    await sendEmail({
      to: driver.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(201).json({ msg: 'Recurring ride rule(s) created successfully.' });

  } catch (err) {
    console.error('!!! ERROR CREATING RECURRING RIDE:', err); 
    res.status(500).json({ message: 'Failed to create recurring ride.', error: err.message });
  }
});

// DELETE route
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const rule = await RecurringRide.findOne({ where: { id: req.params.id, driverId: req.user.id } });
        if (!rule) {
            return res.status(404).json({ msg: 'Rule not found.' });
        }
        await rule.destroy();
        res.json({ msg: 'Recurring ride rule deleted.' });
    } catch (err) {
        console.error('Error deleting recurring ride:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
