const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // false for port 587, true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('Please check your .env EMAIL settings');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Sending from: ${process.env.EMAIL_FROM}`);
  }
});

const sendEmail = async ({ to, subject, text, html, calendarEvent, replyTo }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      replyTo: replyTo || 'info@versoek.nl', // Now replyTo is defined as a parameter
      to,
      subject,
      text,
      html
    };

    // Add calendar attachment if provided
    if (calendarEvent) {
      mailOptions.attachments = [{
        filename: 'invite.ics',
        content: calendarEvent,
        contentType: 'text/calendar'
      }];
      mailOptions.alternatives = [{
        contentType: 'text/calendar',
        content: calendarEvent
      }];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email to:', to);
    console.error('   Error:', error.message);
    throw error;
  }
};

const createCalendarEvent = (rideDetails, action = 'create') => {
  const { departureTime, startPoint, endPoint, driverName, rideId } = rideDetails;
  
  const start = new Date(departureTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const method = action === 'cancel' ? 'CANCEL' : 'REQUEST';
  const status = action === 'cancel' ? 'CANCELLED' : 'CONFIRMED';

  const parseLocation = (locationData) => {
    try {
      const parsed = typeof locationData === 'string' ? JSON.parse(locationData) : locationData;
      return parsed.address || parsed.name || 'Location';
    } catch (e) {
      return 'Location';
    }
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Versoek//Carpool Platform//EN
METHOD:${method}
BEGIN:VEVENT
UID:ride-${rideId}@versoek.nl
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:Carpool: ${parseLocation(startPoint)} → ${parseLocation(endPoint)}
DESCRIPTION:Carpool ride with ${driverName}\\nFrom: ${parseLocation(startPoint)}\\nTo: ${parseLocation(endPoint)}
LOCATION:${parseLocation(startPoint)}
STATUS:${status}
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

module.exports = { sendEmail, createCalendarEvent };
