import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postData } from "@/services/postServices";
import RobotMainPanel from "@/components/robots/RobotMainPanel";
import RobotTrolleyPanel from "@/components/robots/RobotTrolleyPanel";

export default function AddRobotWithTrolley() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const type = location.state?.type || "withTrolley";
  const showTrolley = type === "withTrolley";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [robot, setRobot] = useState({
    RobotName: "",
    Image: null,
    imagePreview: null,
    mqttUrl: "",
    Sections: {
      main: {
        Voltage: "",
        Cycles: "",
        Status: "",
        ActiveBtns: [],
        Topic_subscribe: "",
        Topic_main: "",
      },
      car: showTrolley ? {
        Voltage: "",
        Cycles: "",
        Status: "",
        ActiveBtns: [],
        Topic_subscribe: "",
        Topic_main: "",
      } : {}
    }
  });

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

  const handleSubmit = async () => {
    if (!robot.RobotName) {
      toast.warning("Please enter robot name");
      return;
    }

    if (!robot.mqttUrl) {
      toast.warning("Please enter MQTT URL");
      return;
    }

    console.log("Current robot state:", robot);

    const payload = {
      RobotName: robot.RobotName,
      Image: robot.Image || "",
      projectId: Number(id),
      mqttUrl: robot.mqttUrl,
      isTrolley: showTrolley,
      Sections: {
        main: {
          ...robot.Sections.main,
          Voltage: robot.Sections.main.Voltage ? Number(robot.Sections.main.Voltage) : 0,
          Cycles: robot.Sections.main.Cycles ? Number(robot.Sections.main.Cycles) : 0,
          Status: robot.Sections.main.Status || "Idle",
          ActiveBtns: []
        },
        car: showTrolley ? {
          ...robot.Sections.car,
          Voltage: robot.Sections.car.Voltage ? Number(robot.Sections.car.Voltage) : 0,
          Cycles: robot.Sections.car.Cycles ? Number(robot.Sections.car.Cycles) : 0,
          Status: robot.Sections.car.Status || "Idle",
          ActiveBtns: []
        } : {}
      },
    };

    console.log("Payload to send:", payload);

    try {
      const res = await postData(`${BASE_URL}/robots`, payload);
      toast.success("Robot saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save robot.");
    }
  };

  const updateMainSection = (updates) => {
    setRobot(prev => ({
      ...prev,
      Sections: {
        ...prev.Sections,
        main: { ...prev.Sections.main, ...updates }
      }
    }));
  };

  const updateCarSection = (updates) => {
    setRobot(prev => ({
      ...prev,
      Sections: {
        ...prev.Sections,
        car: { ...prev.Sections.car, ...updates }
      }
    }));
  };

  const updateRobotName = (name) => {
    setRobot(prev => ({ ...prev, RobotName: name }));
  };

  const updateMqttUrl = (url) => {
    setRobot(prev => ({ ...prev, mqttUrl: url }));
  };

  const updateImage = (file, preview) => {
    setRobot(prev => ({ 
      ...prev, 
      Image: file, 
      imagePreview: preview 
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 sm:p-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
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
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-main-color text-white">
              Save
            </Button>
          </div>
        </div>

        {/* TROLLEY SECTION */}
        {showTrolley && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-main-color">
                  Trolley Control
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage trolley controls, schedule and logs
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-6">
              <RobotTrolleyPanel
                carData={robot.Sections.car}
                updateCarSection={updateCarSection}
                imagePreview={robot.imagePreview}
                updateImage={updateImage}
              />
            </div>
          </section>
        )}

        {/* ROBOT SECTION */}
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
                  Enter the password to access the robot control                </h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="password"
                    value={mainPassword}
                    onChange={(e) => setMainPassword(e.target.value)}
                    placeholder="Enter the password"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-color"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
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