import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerStyles = {
    backgroundColor: '#343a40',
    color: '#f8f9fa',
    padding: '20px 20px',
    marginTop: 'auto',
    width: '100%'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  };

  const linksContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '0px'
  };

  const linkStyles = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'opacity 0.3s'
  };

  const copyrightStyles = {
    fontSize: '0.9rem',
    color: '#e0e0e0',
    textAlign: 'center',
    margin: '-10px 0px'
  };

  const dividerStyles = {
    width: '100%',
    maxWidth: '800px',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: '10px 0'
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        <div style={linksContainerStyles}>
          <Link 
            to="/terms" 
            style={linkStyles}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Terms and Conditions
          </Link>
          <Link 
            to="/privacy" 
            style={linkStyles}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/contact" 
            style={linkStyles}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Contact Us
          </Link>
        </div>
        
        <div style={dividerStyles}></div>
        
        <div style={copyrightStyles}>
          <p>&copy; {new Date().getFullYear()} Versoek. All rights reserved.</p>
          <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>
            Corporate Carpooling Platform for a Sustainable Future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
