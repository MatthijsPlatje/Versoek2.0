// server/routes/bulkUsers.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Send invitation email using your existing email service
const sendInvitationEmail = async (email, name, tempPassword) => {
  try {
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000/login';
    
    const subject = 'Welcome to Versoek Carpool - Your Account Details';
    
    const text = `Hi ${name},

Your corporate carpooling account has been created. You can now start sharing rides with your colleagues!

Your Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Important: Please change your password after your first login for security purposes.

Login here: ${loginUrl}

If you have any questions, please contact your administrator.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Welcome to Versoek Carpool!</h2>
        <p>Hi ${name},</p>
        <p>Your corporate carpooling account has been created. You can now start sharing rides with your colleagues!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px;">${tempPassword}</code></p>
        </div>
        
        <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <a href="${loginUrl}" 
           style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Login to Your Account
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact your administrator.
        </p>
      </div>
    `;

    await sendEmail({ to: email, subject, text, html });
    
    console.log(`Invitation email sent to: ${email}`);
    return { success: true };
    
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
};

// @route   POST /api/bulk-users/upload
// @desc    Upload CSV file and create user accounts
// @access  Admin only
router.post('/upload', [auth, adminAuth, upload.single('csvFile')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  const filePath = req.file.path;

  try {
    // Parse CSV file
    const parsePromise = new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    await parsePromise;

    // Validate and create users
    const createdUsers = [];
    const skippedUsers = [];

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const email = row.email || row.Email || row.EMAIL;
      const name = row.name || row.Name || row.NAME || row.fullName || row['Full Name'];
      const department = row.department || row.Department || row.DEPARTMENT || '';

      // Validation
      if (!email || !email.includes('@')) {
        errors.push({ row: i + 1, email, error: 'Invalid or missing email' });
        continue;
      }

      if (!name || name.trim().length < 2) {
        errors.push({ row: i + 1, email, error: 'Invalid or missing name' });
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        skippedUsers.push({ email, reason: 'User already exists' });
        continue;
      }

      // Generate temporary password
      const tempPassword = generatePassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      // Create user
      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        department: department.trim(),
        isAdmin: false
      });

      // Send invitation email
      const emailResult = await sendInvitationEmail(email, name, tempPassword);

      createdUsers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        emailSent: emailResult.success
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Successfully created ${createdUsers.length} user(s)`,
      created: createdUsers,
      skipped: skippedUsers,
      errors: errors
    });

  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Error processing CSV file', error: error.message });
  }
});

// @route   GET /api/bulk-users/all
// @desc    Get all users with pagination and filters
// @access  Admin only
router.get('/all', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', department = '' } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Department filter
    if (department) {
      whereClause.department = department;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bulk-users/departments
// @desc    Get list of all departments
// @access  Admin only
router.get('/departments', [auth, adminAuth], async (req, res) => {
  try {
    const { sequelize } = require('../models');
    
    const departments = await User.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('department')), 'department']],
      where: {
        department: { [Op.ne]: null }
      },
      raw: true
    });

    res.json(departments.map(d => d.department).filter(d => d && d.trim()));

  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bulk-users/:id
// @desc    Update user details
// @access  Admin only
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, department, isAdmin } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (department !== undefined) user.department = department;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bulk-users/:id/update
// @desc    Update user details (POST version to avoid Apache blocking)
// @access  Admin only
router.post('/:id/update', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, department, isAdmin } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (department !== undefined) user.department = department;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bulk-users/:id
// @desc    Delete a user
// @access  Admin only
router.post('/:id/delete', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bulk-users/resend-invitation/:id
// @desc    Resend invitation email with new temporary password
// @access  Admin only
router.post('/resend-invitation/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new temporary password
    const tempPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Send invitation email
    const emailResult = await sendInvitationEmail(user.email, user.name, tempPassword);

    res.json({
      message: 'Invitation email resent successfully',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bulk-users/template
// @desc    Download CSV template for bulk upload
// @access  Admin only
router.get('/template', [auth, adminAuth], (req, res) => {
  const template = [
    { name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering' },
    { name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing' },
    { name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Sales' }
  ];

  const fields = ['name', 'email', 'department'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(template);

  res.header('Content-Type', 'text/csv');
  res.attachment('user-upload-template.csv');
  res.send(csv);
});

// @route   GET /api/bulk-users/export
// @desc    Export all users to CSV
// @access  Admin only
router.get('/export', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const usersJson = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department || '',
      phone: user.phoneNumber || '',
      is_admin: user.isAdmin ? 'Yes' : 'No',
      created_at: user.createdAt,
    }));

    const fields = ['id', 'name', 'email', 'department', 'phone', 'is_admin', 'created_at'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(usersJson);

    res.header('Content-Type', 'text/csv');
    res.attachment(`users-export-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
