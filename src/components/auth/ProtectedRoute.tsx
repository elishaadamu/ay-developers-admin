import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";
import { isAuthenticated } from "../../utilities/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to allow localStorage to be set after login
      await new Promise((resolve) => setTimeout(resolve, 100));

      const isAuth = isAuthenticated();
      setAuthStatus(isAuth);

      if (!isAuth) {
        notification.warning({
          message: "Authentication Required",
          description: "Please sign in to access this page.",
          placement: "topRight",
          duration: 3,
        });
        navigate("/signin", { replace: true });
      }
      setIsLoading(false);
    };

    checkAuth();

    // Set up interval to continuously check auth status
    const authCheckInterval = setInterval(() => {
      if (!localStorage.getItem("userData")) {
        setAuthStatus(false);
        navigate("/signin", { replace: true });
      }
    }, 1000); // Check every second

    return () => clearInterval(authCheckInterval);
  }, [navigate, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return authStatus ? <>{children}</> : null;
};

export default ProtectedRoute;
