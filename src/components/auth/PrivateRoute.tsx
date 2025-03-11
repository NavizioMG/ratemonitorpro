import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const { session } = useAuth();

  // If user is not authenticated, redirect to auth page
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}