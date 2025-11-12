// src/services/postButtons.js
import apiClient from "./apiClient";

export const postButtons = async (robotId, buttons) => {
  if (!robotId || !Array.isArray(buttons)) {
    throw new Error("Invalid data for posting buttons");
  }

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  try {
    if (buttons.length === 0) {
      console.log("No buttons to post");
      return { success: true, message: "No buttons to save" };
    }

    console.log(`Posting ${buttons.length} buttons for robot ${robotId}`);

    for (const btn of buttons) {
      const payload = {
        BtnName: btn.name,
        RobotId: parseInt(robotId),
        Color: btn.Color || "#4CAF50",
        Operation: "/start",
        projectId: 10,
      };

      console.log("Sending button payload:", payload);

      await apiClient.post(`${BASE_URL}/buttons`, payload);
    }

    const res = await apiClient.get(`${BASE_URL}/buttons`);
    console.log("Buttons after posting:", res.data);

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error posting buttons:", error);
    throw error;
  }
};
