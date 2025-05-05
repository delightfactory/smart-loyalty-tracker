
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  
  // Set a timeout to prevent infinite loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Show loader only for a reasonable amount of time
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-lg font-medium">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading (or timeout), redirect to login
  if (!isAuthenticated) {
    console.log("User is not authenticated, redirecting to /auth");
    // Redirect to the login page with a return path
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default RequireAuth;
