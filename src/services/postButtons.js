//  postButtons.js
import apiClient from "./apiClient";

export const postButtons = async (robotId, buttons) => {
  if (!robotId || !Array.isArray(buttons)) {
    throw new Error("Invalid data for posting buttons");
  }

  try {
    if (buttons.length === 0) {
      console.log("No buttons to post");
      return { success: true, message: "No buttons to save" };
    }

    console.log(` Posting ${buttons.length} buttons for robot ${robotId}`);

    for (const btn of buttons) {
      const payload = {
        BtnName: btn.name,
        RobotId: parseInt(robotId),
        Color: btn.Color || "#4CAF50",
        Operation: "/start",
      };

      console.log(" Sending button payload:", payload);

      await apiClient.post("/buttons.php", payload);
    }

    const res = await apiClient.get("/buttons.php");
    console.log(" Buttons after posting:", res.data);

    return { success: true, data: res.data };
  } catch (error) {
    console.error(" Error posting buttons:", error);
    throw error;
  }
};
