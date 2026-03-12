import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions to register');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        ...formData,
        termsAccepted: true // Changed from agreedToTerms to match backend
      });
      
      // NEW: Don't store token or login yet - redirect to verification page
      if (response.data.emailSent) {
        navigate('/verify-pending', { 
          state: { 
            email: formData.email,
            message: response.data.message 
          } 
        });
      } else {
        // Fallback if email wasn't sent (shouldn't happen, but just in case)
        setError('Registration successful but email verification is required. Please check your email.');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Register for Versoek</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        />
        
        {/* Terms Agreement Checkbox */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          <input 
            type="checkbox" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
            style={{ marginRight: '10px', marginTop: '3px' }}
          />
          <span>
            I have read and agree to the{' '}
            <Link 
              to="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2c5f2d', textDecoration: 'underline' }}
            >
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link 
              to="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2c5f2d', textDecoration: 'underline' }}
            >
              Privacy Policy
            </Link>
          </span>
        </label>
        
        <button 
          type="submit"
          disabled={!agreedToTerms}
          style={{ 
            width: '100%', 
            padding: '12px',
            backgroundColor: agreedToTerms ? '#2c5f2d' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: agreedToTerms ? 'pointer' : 'not-allowed'
          }}
        >
          Register
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#2c5f2d' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;
