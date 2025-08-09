import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PYTHAGORA_API_URL, DEPLOYMENT_URL } from "../constants/api";
import { getUserMemberships } from "../api/organizations";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: () => void;
  register: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to safely decode Base64 URL (used in JWT)
const safeBase64UrlDecode = (str: string): string => {
  try {
    // Convert Base64 URL to standard Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode using atob
    const decoded = atob(base64);
    
    // Handle UTF-8 characters properly
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error("Error in safeBase64UrlDecode:", error);
    throw error;
  }
};

// Helper function to decode JWT token and check if it's valid
const isTokenValid = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("AuthContext: Invalid token format - not 3 parts");
      return false;
    }
    
    const payloadStr = safeBase64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadStr);
    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > currentTime && payload.type === 'access';
    
    console.log("AuthContext: Token validation result:", {
      exp: payload.exp,
      currentTime,
      type: payload.type,
      isValid
    });
    
    return isValid;
  } catch (error) {
    console.log("AuthContext: Error decoding token:", error);
    return false;
  }
};

// Helper function to get user data from JWT token
const getUserDataFromToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("AuthContext: Invalid token format for user data extraction");
      return null;
    }
    
    const payloadStr = safeBase64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadStr);
    
    console.log("AuthContext: Extracted user data from token:", {
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName
    });
    
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.fullName
    };
  } catch (error) {
    console.log("AuthContext: Error extracting user data from token:", error);
    return null;
  }
};

// Helper function to get all cookie names for debugging
const getAllCookieNames = (): string[] => {
  const cookies = document.cookie.split(';');
  const cookieNames = cookies.map(cookie => {
    const name = cookie.trim().split('=')[0];
    return name;
  }).filter(name => name.length > 0);

  console.log("DEBUG: All available cookie names:", cookieNames);
  return cookieNames;
};

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  console.log("getCookie: Looking for cookie:", name);
  console.log("getCookie: All cookies:", document.cookie);

  // Debug: Show all available cookie names
  getAllCookieNames();

  const value = `; ${document.cookie}`;
  console.log("getCookie: Formatted cookie string:", value);

  const parts = value.split(`; ${name}=`);
  console.log("getCookie: Split parts:", parts);
  console.log("getCookie: Parts length:", parts.length);

  if (parts.length === 2) {
    const result = parts.pop()?.split(';').shift() || null;
    console.log("getCookie: Extracted value:", result);
    return result;
  }

  console.log("getCookie: Cookie not found");
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper function to store user data in localStorage
const storeUserData = async (accessToken: string) => {
  try {
    const userData = getUserDataFromToken(accessToken);
    if (!userData) {
      console.log("AuthContext: Unable to extract user data from token");
      return;
    }

    // Store basic user data
    localStorage.setItem("userId", userData.userId);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("accessToken", accessToken);

    console.log("AuthContext: Fetching user organization memberships");

    // Fetch organization memberships
    try {
      const memberships = await getUserMemberships(userData.userId);

      if (memberships.success && memberships.memberships.length > 0) {
        // For now, consider only the first membership as specified in requirements
        const primaryMembership = memberships.memberships[0];
        localStorage.setItem("organizationId", primaryMembership.organizationId);
        localStorage.setItem("organizationSlug", primaryMembership.organizationSlug);

        console.log("AuthContext: Organization data stored in localStorage", {
          organizationId: primaryMembership.organizationId,
          organizationSlug: primaryMembership.organizationSlug
        });
      } else {
        // User has no organization memberships
        localStorage.removeItem("organizationId");
        localStorage.removeItem("organizationSlug");
        console.log("AuthContext: User has no organization memberships");
      }
    } catch (error) {
      console.error("AuthContext: Error fetching organization memberships:", error);
      // Don't fail authentication if organization fetch fails
      localStorage.removeItem("organizationId");
      localStorage.removeItem("organizationSlug");
    }

    console.log("AuthContext: User data successfully stored in localStorage");
  } catch (error) {
    console.error("AuthContext: Error storing user data:", error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      console.log("AuthContext: Checking authentication status");
      setLoading(true);

      // First, try to get accessToken from localStorage
      let accessToken = localStorage.getItem("accessToken");
      console.log("AuthContext: Access token from localStorage:", !!accessToken);

      if (accessToken && isTokenValid(accessToken)) {
        console.log("AuthContext: Valid access token found, setting authenticated");
        setIsAuthenticated(true);
        setLoading(false);
        // Update user data in localStorage (including organization info)
        await storeUserData(accessToken);
        return true;
      }

      // If token is invalid or missing, remove it
      if (accessToken) {
        console.log("AuthContext: Invalid access token found, removing from localStorage");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("organizationId");
        localStorage.removeItem("organizationSlug");
      }

      // Try to refresh using httpOnly cookie
      console.log("AuthContext: No valid access token, attempting refresh with httpOnly cookie");
      const response = await fetch(`${PYTHAGORA_API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This will include httpOnly cookies
        body: JSON.stringify({}), // Empty payload as requested
      });

      console.log("AuthContext: Refresh response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Refresh response received:", !!data.accessToken);
        console.log("AuthContext: Refresh token payload")

        if (data.accessToken && isTokenValid(data.accessToken)) {
          console.log("AuthContext: New valid access token received, storing user data");
          await storeUserData(data.accessToken);
          setIsAuthenticated(true);
          setLoading(false);
          return true;
        }
      } else {
        const errorText = await response.text();
        console.log("AuthContext: Refresh failed with error:", errorText);
      }

      // If refresh failed, user is not authenticated
      console.log("AuthContext: Refresh failed, user not authenticated - redirecting to Pythagora login");
      setIsAuthenticated(false);
      setLoading(false);
      
      // Clean up any remaining auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("organizationId");
      localStorage.removeItem("organizationSlug");
      
      return false;
    } catch (error) {
      console.error("AuthContext: Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("organizationId");
      localStorage.removeItem("organizationSlug");
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  };

  const login = () => {
    console.log("AuthContext: Redirecting to Pythagora login");
    window.location.href = `https://pythagora.ai/log-in?return_to=${DEPLOYMENT_URL}`;
  };

  const register = () => {
    console.log("AuthContext: Redirecting to Pythagora register");
    window.location.href = `https://pythagora.ai/log-in?return_to=${DEPLOYMENT_URL}`;
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationSlug");
    // Note: We can't delete httpOnly cookies from JavaScript
    setIsAuthenticated(false);
    window.location.href = `https://pythagora.ai/log-in?return_to=${DEPLOYMENT_URL}`;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, setIsAuthenticated, login, register, logout, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}