import apiClient from "./apiClient";

/**
 * 
 * @param {string} endpoint 
 */
export const deleteData = async (endpoint) => {
  const response = await apiClient.delete(endpoint);
  return response.data;
};
