import api from "./api";

// Description: Login user functionality
// Endpoint: POST /auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /auth/register
// Request: { name: string, email: string, password: string }
// Response: { email: string, accessToken: string }
export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Refresh token functionality
// Endpoint: POST /auth/refresh-token
// Request: { refreshToken: string }
// Response: { success: boolean, data: { accessToken: string, refreshToken: string } }
export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get current user info
// Endpoint: GET /auth/me
// Request: {}
// Response: { userId: string, email: string, name: string, subscription: object }
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post("/auth/logout");
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};