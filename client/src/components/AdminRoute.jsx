// client/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  let decodedPayload = null;

  if (token) {
    try {
      decodedPayload = jwtDecode(token);
    } catch (error) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  }

  // Check for token, user, AND isAdmin flag
  if (!decodedPayload || !decodedPayload.user || !decodedPayload.user.isAdmin) {
    // Redirect to home if not an admin
    return <Navigate to="/" />;
  }

  const user = decodedPayload.user;
  return <Component user={user} {...rest} />;
};

export default AdminRoute;
