import apiClient from "./apiClient";

/**
 * DELETE request
 * @param {string} endpoint 
 */
export const deleteData = async (endpoint) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(" DELETE Error:", error);
    throw error;
  }
};
