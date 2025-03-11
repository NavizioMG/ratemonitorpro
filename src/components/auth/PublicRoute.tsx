import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

export function PublicRoute({ children }: Props) {
  const { session } = useAuth();

  // If user is authenticated, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}