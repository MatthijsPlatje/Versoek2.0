require('dotenv').config();
const { sendEmail } = require('./services/emailService');

const testEmail = async () => {
  console.log('\n🧪 Testing email configuration...\n');
  console.log('Email settings:');
  console.log('- Host:', process.env.EMAIL_HOST);
  console.log('- Port:', process.env.EMAIL_PORT);
  console.log('- From:', process.env.EMAIL_FROM);
  console.log('- User:', process.env.EMAIL_USER);
  console.log('- Password:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set');
  console.log('\n');

  try {
    const result = await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: '✅ Versoek Platform - Email Test Success!',
      text: 'Congratulations! Your Versoek email system is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">✅ Email Configuration Successful!</h1>
          <p>Your Versoek carpooling platform is now configured to send emails.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Platform:</strong> Versoek</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Email system operational</p>
            <p style="margin: 5px 0;"><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>You can now receive ride requests, booking confirmations, and other notifications!</p>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            This is an automated test email from Versoek Carpool Platform
          </p>
        </div>
      `
    });

    console.log('\n✅ SUCCESS! Test email sent successfully!');
    console.log('📬 Check your inbox:', process.env.EMAIL_USER);
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED! Could not send test email');
    console.error('\nError details:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Wrong Gmail address or app password');
    console.error('2. App password not created (need 2FA enabled first)');
    console.error('3. App password has spaces (remove them in .env)');
    console.error('4. "Less secure app access" needs to be disabled (use app password instead)');
    console.error('\n');
    process.exit(1);
  }
};

testEmail();
