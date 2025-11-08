import apiClient from "./apiClient";

/**
 * GET request
 * @param {string} endpoint 
 */
export const getData = async (endpoint) => {
  try {
    const response = await apiClient.get(endpoint, { headers: { "Cache-Control": "no-cache" } });
    return response.data;
  } catch (error) {
    console.error(" GET Error:", error);
    throw error;
  }
};
