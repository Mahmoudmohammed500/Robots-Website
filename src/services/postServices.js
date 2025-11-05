import apiClient from "./apiClient";

export const postData = async (endpoint, data) => {
  const response = await apiClient.post(endpoint, data);
  return response.data;
};
