import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const email = location.state?.email || '';
  const message = location.state?.message || 'Please check your email to verify your account.';

  const handleResendEmail = async () => {
    setResending(true);
    setResendMessage('');
    
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      setResendMessage(response.data.message);
    } catch (error) {
      setResendMessage(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px',
    backgroundColor: '#f5f5f5'
  };

  const cardStyles = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%'
  };

  const iconStyles = {
    fontSize: '64px',
    marginBottom: '20px'
  };

  const buttonStyles = {
    backgroundColor: '#2c5f2d',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px'
  };

  const linkStyles = {
    color: '#2c5f2d',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginTop: '15px',
    display: 'inline-block'
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconStyles}>📧</div>
        <h1 style={{ color: '#2c5f2d', marginBottom: '10px' }}>Check Your Email!</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
          {message}
        </p>

        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '20px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #c8e6c9'
        }}>
          <p style={{ margin: 0, color: '#2e7d32' }}>
            <strong>Email sent to:</strong> {email}
          </p>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h3 style={{ color: '#333', fontSize: '1rem' }}>What to do next:</h3>
          <ol style={{ paddingLeft: '20px', color: '#666' }}>
            <li style={{ marginBottom: '10px' }}>
              Check your inbox for an email from Versoek
            </li>
            <li style={{ marginBottom: '10px' }}>
              Click the verification link in the email
            </li>
            <li style={{ marginBottom: '10px' }}>
              Log in with your credentials after verification
            </li>
          </ol>
        </div>

        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ffeaa7',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
            <strong>💡 Tip:</strong> The verification link expires in 24 hours. 
            Don't forget to check your spam folder if you don't see the email!
          </p>
        </div>

        {resendMessage && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '15px',
            backgroundColor: resendMessage.includes('sent') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${resendMessage.includes('sent') ? '#c3e6cb' : '#f5c6cb'}`,
            color: resendMessage.includes('sent') ? '#155724' : '#721c24'
          }}>
            {resendMessage}
          </div>
        )}

        <button 
          onClick={handleResendEmail}
          disabled={resending}
          style={{
            ...buttonStyles,
            backgroundColor: resending ? '#ccc' : '#2c5f2d',
            cursor: resending ? 'not-allowed' : 'pointer'
          }}
        >
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Already verified?{' '}
            <span 
              onClick={() => navigate('/login')} 
              style={linkStyles}
            >
              Go to Login
            </span>
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
            Wrong email?{' '}
            <span 
              onClick={() => navigate('/register')} 
              style={linkStyles}
            >
              Register Again
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPending;
