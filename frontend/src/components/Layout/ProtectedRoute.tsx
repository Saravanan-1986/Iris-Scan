import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = isAuthenticated();
  const location = useLocation();
  if (!auth) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
