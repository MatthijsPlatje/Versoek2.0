// server/routes/contact.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { sendEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { name, email, company, phone, subject, message, recaptchaToken } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Please complete the reCAPTCHA' });
    }

    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    if (!recaptchaResponse.data.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResponse.data);
      return res.status(400).json({ 
        message: 'reCAPTCHA verification failed. Please try again.' 
      });
    }

    // Email to business
    const emailSubject = `New Contact Form Submission: ${subject}`;
    const emailText = `
New contact form submission from Versoek website:

Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
Reply to: ${email}
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">New Contact Form Submission</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
          This message was sent from the Versoek contact form.
        </p>
      </div>
    `;

    // Send email to your business address
    await sendEmail({
      to: 'info@versoek.nl', // Change to your actual business email
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    // Optional: Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting Versoek',
      text: `Hello ${name},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nThe Versoek Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Thank You for Contacting Us</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to Versoek. We have received your message and will respond within 24 hours.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${message}</p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">Best regards,<br>The Versoek Team</p>
        </div>
      `
    });

    res.json({ message: 'Contact form submitted successfully' });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
