import apiClient from "./apiClient";

export const postData = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(" POST Error: ", error);
    throw error;
  }
};
