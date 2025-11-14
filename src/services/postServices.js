import apiClient from "./apiClient";

export const postData = async (endpoint, data, config = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error("POST Error: ", error);
    throw error;
  }
};
