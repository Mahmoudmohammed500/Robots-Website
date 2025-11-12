import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TabsHeader from "@/components/robots/TabsHeader";
import RobotMainPanel from "@/components/robots/RobotMainPanel";
import NotificationsTab from "@/components/robots/NotificationsTab";
import LogsTab from "@/components/robots/LogsTab";
import { postData } from "@/services/postServices";
import { toast } from "react-hot-toast";

export default function AddRobotOnly() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // ✅ Available buttons list - matches Documentation exactly
  const availableButtons = [
    { Name: "Forward", id: "1" },
    { Name: "stop", id: "2" }, // lowercase 's' as in Documentation
    { Name: "Backward", id: "3" },
    { Name: "Left", id: "4" },
    { Name: "Right", id: "5" },
  ];

  // ✅ Robot data state
  const [robot, setRobot] = useState({
    RobotName: "",
    Image: "warehousebot.png",
    projectId: id || "",
    Voltage: 24,
    Cycles: 500,
    Status: "Running",
    ActiveBtns: [],
    isTrolley: false,
  });

  const [tab, setTab] = useState("control");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ Toggle button selection
  const toggleButtonSelection = (btn) => {
    setRobot((prev) => {
      const exists = prev.ActiveBtns.some((b) => b.id === btn.id);
      return {
        ...prev,
        ActiveBtns: exists
          ? prev.ActiveBtns.filter((b) => b.id !== btn.id)
          : [...prev.ActiveBtns, btn],
      };
    });
  };

  // ✅ Send data with exact structure from Documentation
  const handleSave = async () => {
    if (!robot.RobotName.trim()) {
      toast.error("Please enter a robot name!");
      return;
    }

    if (!robot.projectId) {
      toast.error("Project ID is missing!");
      return;
    }

    setLoading(true);

    try {
      // ✅ Create payload with exact structure from Documentation
      const payload = {
        RobotName: robot.RobotName.trim(),
        Image: robot.Image.includes("blob:") ? "warehousebot.png" : robot.Image,
        projectId: Number(robot.projectId),
        mqttUrl: "mqtt://192.168.1.50:1883",
        isTrolley: robot.isTrolley,
        Sections: {
          main: {
            Voltage: Number(robot.Voltage) || 24,
            Cycles: Number(robot.Cycles) || 500,
            Status: robot.Status || "Running",
            ActiveBtns:
              robot.ActiveBtns.length > 0
                ? robot.ActiveBtns
                : [
                    { Name: "Forward", id: "1" },
                    { Name: "stop", id: "2" },
                  ],
            Topic_subscribe: "robot/main/in",
            Topic_main: "robot/main/out",
          },
          // ✅ Fix: Always include car section but conditionally set its content
          ...(robot.isTrolley && {
            car: {
              Voltage: Number(robot.Voltage) || 24,
              Cycles: Number(robot.Cycles) || 500,
              Status: robot.Status || "Running",
              ActiveBtns:
                robot.ActiveBtns.length > 0
                  ? robot.ActiveBtns
                  : [
                      { Name: "Forward", id: "1" },
                      { Name: "stop", id: "2" },
                    ],
              Topic_subscribe: "robot/main/in",
              Topic_main: "robot/main/out",
            },
          }),
        },
      };

      // ✅ Ensure car section is completely removed when isTrolley is false
      if (!robot.isTrolley) {
        delete payload.Sections.car;
      }

      console.log(
        "📦 Final Payload (Exact Documentation Match):",
        JSON.stringify(payload, null, 2)
      );

      const response = await postData(`${BASE_URL}/robots`, payload);
      console.log("✅ Robot added successfully:", response);
      toast.success("Robot added successfully!");
      navigate(-1);
    } catch (error) {
      console.error("❌ Error saving robot:", error);

      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Network error! Please check:\n1. Server is running\n2. CORS is configured"
        );
      } else if (error.response) {
        toast.error(
          `Server error: ${error.response.status} - ${error.response.statusText}`
        );
      } else {
        toast.error("Failed to save robot. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle isTrolley state
  const toggleTrolley = () => {
    setRobot((prev) => ({
      ...prev,
      isTrolley: !prev.isTrolley,
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* ------- Header ------- */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-main-color">Add Robot</h1>
            <p className="text-sm text-gray-500">
              Project: {location.state?.projectName || id}
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

        {/* ------- Main Panel ------- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
         
          {/* <TabsHeader
            tabs={[
              { id: "control", label: "Control" },
              { id: "notifications", label: "Notifications" },
              { id: "logs", label: "Logs" },
            ]}
            active={tab}
            onChange={setTab}
          /> */}

          <div className="mt-6">
            {tab === "control" && (
              <>
                <RobotMainPanel robot={robot} setRobot={setRobot} />

                {/* ------- Trolley Toggle ------- */}
                {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={robot.isTrolley}
                        onChange={toggleTrolley}
                      />
                      <div
                        className={`block w-14 h-8 rounded-full transition ${
                          robot.isTrolley ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          robot.isTrolley ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="text-gray-700 font-medium">
                      Is Trolley: {robot.isTrolley ? "Yes" : "No"}
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    {robot.isTrolley
                      ? "Trolley mode: Both main and car sections will be included"
                      : "Robot mode: Only main section will be included (car section will be completely removed)"}
                  </p>
                </div> */}

                {/* ------- Active Buttons Section ------- */}
                {/* <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Select Active Buttons
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableButtons.map((btn) => {
                      const isSelected = robot.ActiveBtns.some(
                        (b) => b.id === btn.id
                      );
                      return (
                        <button
                          key={btn.id}
                          onClick={() => toggleButtonSelection(btn)}
                          className={`rounded-xl border py-3 text-center font-medium transition ${
                            isSelected
                              ? "bg-main-color text-white border-main-color"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {btn.Name}
                        </button>
                      );
                    })}
                  </div>
                  {robot.ActiveBtns.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected:{" "}
                      {robot.ActiveBtns.map((btn) => btn.Name).join(", ")}
                    </p>
                  )}
                </div> */}
              </>
            )}

            {tab === "notifications" && <NotificationsTab />}
            {tab === "logs" && <LogsTab />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
