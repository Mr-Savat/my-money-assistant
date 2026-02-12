import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is logged in
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (the dashboard)
  return children;
};

export default ProtectedRoute;