const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { sendEmail } = require('../services/emailService');
const router = express.Router();
const { Op } = require('sequelize');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber, termsAccepted } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      termsAccepted: termsAccepted || false,
      termsAcceptedAt: termsAccepted ? new Date() : null,
      isEmailVerified: false, // Not verified yet
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Versoek Account',
      text: `Hello ${name},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nVersoek Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">Welcome to Versoek!</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering with Versoek, the corporate carpooling platform.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="color: #2c5f2d; margin-top: 0;">Please Verify Your Email Address</h2>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #2c5f2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
              Verify My Email
            </a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;"><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
          
          <p>Once verified, you can:</p>
          <ul>
            <li>Create and join carpool rides</li>
            <li>Connect with colleagues for sustainable commuting</li>
            <li>Access your personalized dashboard</li>
          </ul>
          
          <p>If you didn't create this account, please ignore this email.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Best regards,<br>
            The Versoek Team
          </p>
        </div>
      `
    });

    // Don't return sensitive information
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    };

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      user: userResponse,
      emailSent: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ 
        message: 'Verification token is required',
        verified: false 
      });
    }

    // Find user with this token (no expiration check yet)
    let user = await User.findOne({
      where: { emailVerificationToken: token }
    });

    // If not found with token, check if recently verified
    if (!user) {
      // Maybe token was just used - check by recent verification
      user = await User.findOne({
        where: {
          isEmailVerified: true,
          updatedAt: {
            [Op.gt]: new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
          }
        },
        order: [['updatedAt', 'DESC']],
        limit: 1
      });

      if (user) {
        // Token was just used
        return res.status(200).json({ 
          message: 'Your email is already verified! You can log in now.',
          verified: true,
          alreadyVerified: true
        });
      }

      return res.status(400).json({ 
        message: 'Invalid or expired verification token',
        verified: false 
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: 'Your email is already verified! You can log in now.',
        verified: true,
        alreadyVerified: true
      });
    }

    // Check expiration
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ 
        message: 'Verification token has expired',
        verified: false
      });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Send welcome email (async, don't wait)
    sendEmail({
      to: user.email,
      subject: 'Welcome to Versoek - Account Verified!',
      text: `Hello ${user.name},\n\nYour email has been successfully verified!\n\nLogin here: ${process.env.CLIENT_URL}/login\n\nBest regards,\nVersoek Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">🎉 Account Verified!</h1>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your email has been successfully verified.</p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;"><strong>✅ Your account is now active!</strong></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background-color: #2c5f2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Login
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Best regards,<br>
            The Versoek Team
          </p>
        </div>
      `
    }).catch(err => console.error('Welcome email error:', err));

    return res.status(200).json({ 
      message: 'Email verified successfully! You can now log in.',
      verified: true 
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      verified: false
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email address before logging in',
        emailNotVerified: true,
        email: user.email
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send new verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Versoek Account - New Link',
      text: `Hello ${user.name},\n\nHere's your new verification link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nVersoek Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">New Verification Link</h1>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a new email verification link.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #2c5f2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify My Email
            </a>
          </div>
          
          <p>This link will expire in 24 hours.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Best regards,<br>
            The Versoek Team
          </p>
        </div>
      `
    });

    res.json({ message: 'Verification email sent! Please check your inbox.' });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
