import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      
      console.log('Verification response:', response.data); // Debug log
      
      if (response.data.verified) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Verification error:', error); // Debug log
      setStatus('error');
      
      // Handle different error cases
      if (error.response?.status === 400) {
        setMessage(error.response.data.message || 'Invalid or expired verification token');
      } else if (error.response?.status === 500) {
        setMessage('Server error during verification. Please try again later.');
      } else {
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    }
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    padding: '20px'
  };

  const cardStyles = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
            <h1>Verifying Email...</h1>
            <p>Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h1 style={{color: '#2c5f2d'}}>Email Verified!</h1>
            <p style={{ fontSize: '1.1rem' }}>{message}</p>
            <p style={{ color: '#666', marginTop: '20px' }}>
              Redirecting to login in 3 seconds...
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#2c5f2d',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px',
                fontSize: '1rem'
              }}
            >
              Go to Login Now
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h1 style={{color: '#dc3545'}}>Verification Failed</h1>
            <p style={{ fontSize: '1rem', marginBottom: '20px' }}>{message}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#2c5f2d',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Try to Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Register Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
