import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ALLOWED_EMAILS = ['ingenuity@iitbhilai.ac.in', 'amayd@iitbhilai.ac.in'];

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !ALLOWED_EMAILS.includes(user.email || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}