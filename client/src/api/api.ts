import axios, { AxiosRequestConfig, AxiosError } from "axios";
import JSONbig from "json-bigint";
import { PYTHAGORA_API_URL, DEPLOYMENT_URL } from "../constants/api";

const pythagoraApi = axios.create({
  baseURL: PYTHAGORA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => JSONbig.parse(data)],
});

// Initialize accessToken immediately from localStorage
let accessToken: string | null = localStorage.getItem("accessToken");
console.log("API: Initial access token from localStorage:", !!accessToken);

// Helper function to get all cookie names for debugging
const getAllCookieNames = (): string[] => {
  const cookies = document.cookie.split(';');
  const cookieNames = cookies.map(cookie => {
    const name = cookie.trim().split('=')[0];
    return name;
  }).filter(name => name.length > 0);

  console.log("API DEBUG: All available cookie names:", cookieNames);
  return cookieNames;
};

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  console.log("API getCookie: Looking for cookie:", name);
  console.log("API getCookie: All cookies:", document.cookie);

  // Debug: Show all available cookie names
  getAllCookieNames();

  const value = `; ${document.cookie}`;
  console.log("API getCookie: Formatted cookie string:", value);

  const parts = value.split(`; ${name}=`);
  console.log("API getCookie: Split parts:", parts);
  console.log("API getCookie: Parts length:", parts.length);

  if (parts.length === 2) {
    const result = parts.pop()?.split(';').shift() || null;
    console.log("API getCookie: Extracted value:", result);
    return result;
  }

  console.log("API getCookie: Cookie not found");
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {
      console.log("API: Making request to Pythagora API:", config.url);

      // Always ensure we have the latest token from localStorage
      if (!accessToken) {
        accessToken = localStorage.getItem("accessToken");
        console.log("API: Retrieved token from localStorage:", !!accessToken);
      }

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log("API: Added Authorization header");
      } else {
        console.log("API: No token available for request");
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<any> => {
      console.log("API: Response error interceptor triggered", error.response?.status);

      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        [401, 403].includes(error.response?.status) &&
        !originalRequest._retry
      ) {
        console.log("API: Attempting token refresh due to 401/403 error");
        originalRequest._retry = true;

        try {
          console.log("API: Making refresh token request to Pythagora API with httpOnly cookie");
          const refreshResponse = await fetch(`${PYTHAGORA_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // This will include httpOnly cookies
            body: JSON.stringify({}), // Empty payload as requested
          });

          console.log("API: Refresh response status:", refreshResponse.status);

          if (!refreshResponse.ok) {
            console.log("API: Refresh response not ok, status:", refreshResponse.status);
            const errorText = await refreshResponse.text();
            console.log("API: Refresh error response:", errorText);
            throw new Error("Token refresh failed");
          }

          const data = await refreshResponse.json();
          console.log("API: Refresh response data received:", !!data.accessToken);

          if (data.accessToken) {
            accessToken = data.accessToken;
            localStorage.setItem("accessToken", accessToken);
            console.log("API: New access token stored, retrying original request");

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return pythagoraApi(originalRequest);
          } else {
            console.log("API: No access token in refresh response");
            throw new Error("No access token in refresh response");
          }
        } catch (err) {
          console.log("API: Token refresh failed, cleaning up and redirecting");
          localStorage.removeItem("accessToken");
          accessToken = null;
          window.location.href = `https://pythagora.ai/log-in?return_to=${DEPLOYMENT_URL}`;
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    },
  );
};

setupInterceptors(pythagoraApi);

const api = {
  request: (config: AxiosRequestConfig) => {
    return pythagoraApi(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    return pythagoraApi.get(url, config);
  },
  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    return pythagoraApi.post(url, data, config);
  },
  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    return pythagoraApi.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    return pythagoraApi.delete(url, config);
  },
};

export default api;