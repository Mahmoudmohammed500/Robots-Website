import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import RobotMainPanel from "@/components/robots/RobotMainPanel";
import { postData } from "@/services/postServices";

export default function AddRobotOnly() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [robot, setRobot] = useState({
    RobotName: "",
    Image: null,
    imagePreview: null,
    mqttUrl: "",
    projectId: id || "",
    isTrolley: false,
    Sections: {
      main: {
        Voltage: "",
        Cycles: "",
        Status: "",
        ActiveBtns: [],
        Topic_subscribe: "",
        Topic_main: "",
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [isMainUnlocked, setIsMainUnlocked] = useState(false);
  const [mainPassword, setMainPassword] = useState("");
  const MAIN_PASSWORD = "#aoxns@343."; 

  const handlePasswordSubmit = () => {
    if (mainPassword === MAIN_PASSWORD) {
      setIsMainUnlocked(true);
      toast.success("Robot section has been successfully opened.");
      setMainPassword("");
    } else {
      toast.error("Incorrect password");
      setMainPassword("");
    }
  };

  const updateMainSection = (updates) => {
    setRobot((prev) => ({
      ...prev,
      Sections: {
        ...prev.Sections,
        main: { ...prev.Sections.main, ...updates },
      },
    }));
  };

  const updateRobotName = (name) => {
    setRobot((prev) => ({ ...prev, RobotName: name }));
  };

  const updateMqttUrl = (url) => {
    setRobot((prev) => ({ ...prev, mqttUrl: url }));
  };

  const updateImage = (file, preview) => {
    setRobot((prev) => ({
      ...prev,
      Image: file,
      imagePreview: preview,
    }));
  };

  const handleSave = async () => {
    if (!robot.RobotName.trim())
      return toast.error("Please enter a robot name!");
    if (!robot.mqttUrl.trim()) return toast.error("Please enter MQTT URL!");
    if (!robot.projectId) return toast.error("Project ID is missing!");

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("RobotName", robot.RobotName.trim());
      fd.append("mqttUrl", robot.mqttUrl.trim());
      fd.append("projectId", robot.projectId);
      fd.append("isTrolley", robot.isTrolley ? 1 : 0);
      fd.append("Sections", JSON.stringify(robot.Sections));

      // Append image file only if selected
      if (robot.Image) {
        fd.append("Image", robot.Image);
      }

      const res = await fetch(`${BASE_URL}/robots`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.success || data.message?.toLowerCase().includes("success")) {
        toast.success("Robot added successfully!");
        navigate(-1);
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("❌ Error saving robot:", err);
      toast.error("Failed to save robot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* ------- Header ------- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-main-color">Add Robot</h1>
            <p className="text-sm text-gray-500 mt-1">
              Project ID: <span className="font-mono">{id || "-"}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white border text-main-color"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-main-color text-white hover:bg-main-color/90"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* ------- Robot Section ------- */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-main-color">Robot</h2>
              <p className="text-sm text-gray-500 mt-1">
                Robot settings, controls & logs
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {!isMainUnlocked ? (
              // Password Input Section
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-main-color mb-4">
                  Enter the password to access the robot control{" "}
                </h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="password"
                    value={mainPassword}
                    onChange={(e) => setMainPassword(e.target.value)}
                    placeholder="Enter the password"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handlePasswordSubmit}
                    className="bg-main-color text-white"
                  >
                    open
                  </Button>
                </div>
              </div>
            ) : (
              // Main Control Section (Unlocked)
              <RobotMainPanel
                mainData={robot.Sections.main}
                updateMainSection={updateMainSection}
                robotName={robot.RobotName}
                updateRobotName={updateRobotName}
                imagePreview={robot.imagePreview}
                updateImage={updateImage}
                mqttUrl={robot.mqttUrl}
                updateMqttUrl={updateMqttUrl}
              />
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
