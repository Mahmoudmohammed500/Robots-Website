import apiClient from "./apiClient";

/**
 * @param {string} endpoint 
 * @returns {Promise<any>}
 */
export const getData = async (endpoint) => {
  const response = await apiClient.get(endpoint);
  return response.data;
};
