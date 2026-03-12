// client/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  let decodedPayload = null;

  if (token) {
    try {
      decodedPayload = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  }

  if (!decodedPayload) {
    return <Navigate to="/login" />;
  }

  // --- THE CRUCIAL FIX ---
  // Instead of passing the whole payload, pass the nested 'user' object.
  const user = decodedPayload.user;

  // Now, the 'user' prop will be the simple { id: ..., name: ... } object.
  return <Component user={user} {...rest} />;
};

export default ProtectedRoute;
