import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  deniedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  deniedRoles,
  redirectTo
}: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let role: string | undefined;

  try {
    const parsed = JSON.parse(userStr);
    role = parsed?.role;
  } catch (error) {
    console.error('Unable to parse user from localStorage:', error);
    return <Navigate to="/login" replace />;
  }

  const fallbackRedirect =
    role === 'super_admin' || role === 'admin' ? '/admin/dashboard' : '/dashboard';

  if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={redirectTo || fallbackRedirect} replace />;
  }

  if (deniedRoles && deniedRoles.length > 0 && role && deniedRoles.includes(role)) {
    return <Navigate to={redirectTo || fallbackRedirect} replace />;
  }

  return <>{children}</>;
}

