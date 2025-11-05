import apiClient from "./apiClient";

/**
 * 
 * @param {string} endpoint 
 * @param {object} data 
 */
export const putData = async (endpoint, data) => {
  const response = await apiClient.put(endpoint, data);
  return response.data;
};
