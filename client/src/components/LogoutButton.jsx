// client/src/components/LogoutButton.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');

    // Redirect to the home page
    navigate('/');
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
      Logout
    </button>
  );
};

export default LogoutButton;
