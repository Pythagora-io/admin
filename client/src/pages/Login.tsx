import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, checkAuthStatus } = useAuth();

  useEffect(() => {
    console.log("Login: useEffect triggered, isAuthenticated:", isAuthenticated);

    // Check if we're returning from Pythagora with tokens
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken) {
      console.log("Login: Found tokens in URL, storing and redirecting");
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        // Set refresh token as httpOnly cookie (this would normally be set by the server)
        document.cookie = `pythagora_refresh_token=${refreshToken}; path=/; secure; samesite=strict`;
      }
      
      // Check if there's a return_to parameter in the URL
      const returnTo = searchParams.get('return_to');
      // Check if there's a state from navigation (when redirected from protected route)
      const from = location.state?.from?.pathname + (location.state?.from?.search || '');
      // Determine where to redirect
      const redirectTo = returnTo || from || '/';
      
      console.log("Login: Redirecting to:", redirectTo);
      navigate(redirectTo, { replace: true });
      return;
    }

    if (isAuthenticated) {
      console.log("Login: User already authenticated, checking for redirect");

      // Check if there's a return_to parameter in the URL
      const returnTo = searchParams.get('return_to');
      // Check if there's a state from navigation (when redirected from protected route)
      const from = location.state?.from?.pathname + (location.state?.from?.search || '');
      // Determine where to redirect
      const redirectTo = returnTo || from || '/';

      console.log("Login: Redirecting to:", redirectTo);
      navigate(redirectTo, { replace: true });
    } else {
      // User is not authenticated, check auth status first
      console.log("Login: User not authenticated, checking auth status");
      checkAuthStatus().then((isAuth) => {
        if (isAuth) {
          console.log("Login: Auth check successful, redirecting");
          const returnTo = searchParams.get('return_to');
          const from = location.state?.from?.pathname + (location.state?.from?.search || '');
          const redirectTo = returnTo || from || '/';
          navigate(redirectTo, { replace: true });
        } else {
          console.log("Login: Auth check failed, redirecting to Pythagora login");
          // Redirect to Pythagora login after a short delay to show the login page briefly
          setTimeout(() => {
            login();
          }, 1000);
        }
      });
    }
  }, [isAuthenticated, navigate, searchParams, location.state, login, checkAuthStatus]);

  // If user is authenticated, don't render the login form
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please use the Pythagora authentication system to log in.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Redirecting to Pythagora login...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}