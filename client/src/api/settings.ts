import api from "./api";

// Description: Get user settings
// Endpoint: GET /settings
// Request: {}
// Response: { settings: { [key: string]: boolean } }
export const getUserSettings = async () => {
  try {
    const response = await api.get("/settings");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user settings
// Endpoint: PUT /settings
// Request: { settings: { [key: string]: boolean } }
// Response: { success: boolean, message: string, settings: { [key: string]: boolean } }
export const updateUserSettings = async (data: {
  settings: { [key: string]: boolean };
}) => {
  try {
    const response = await api.put("/settings", data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get setting descriptions
// Endpoint: GET /settings/descriptions
// Request: {}
// Response: { descriptions: { [key: string]: { title: string, description: string } } }
export const getSettingDescriptions = async () => {
  try {
    const response = await api.get("/settings/descriptions");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};