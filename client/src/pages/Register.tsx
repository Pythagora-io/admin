import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";

export function Register() {
  const { register, checkAuthStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Register: useEffect triggered, isAuthenticated:", isAuthenticated);
    
    // Check if we're returning from Pythagora with tokens
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken) {
      console.log("Register: Found tokens in URL, storing and redirecting");
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        // Set refresh token as httpOnly cookie (this would normally be set by the server)
        document.cookie = `pythagora_refresh_token=${refreshToken}; path=/; secure; samesite=strict`;
      }
      navigate('/', { replace: true });
      return;
    }

    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      console.log("Register: User already authenticated, redirecting to home");
      navigate('/', { replace: true });
      return;
    }

    // If no tokens in URL and not authenticated, check current auth status
    checkAuthStatus().then((isAuth) => {
      console.log("Register: Auth check result:", isAuth);
      if (isAuth) {
        console.log("Register: Auth check successful, redirecting to home");
        navigate('/', { replace: true });
      } else {
        console.log("Register: Not authenticated, redirecting to Pythagora register");
        // Redirect to Pythagora login/register
        register();
      }
    });
  }, [register, checkAuthStatus, isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-heading-3 font-medium">Redirecting to Pythagora Registration...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </AuthLayout>
  );
}