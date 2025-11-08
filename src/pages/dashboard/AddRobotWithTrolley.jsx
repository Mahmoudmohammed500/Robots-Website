import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TabsHeader from "@/components/robots/TabsHeader";
import NotificationsTab from "@/components/robots/NotificationsTab";
import LogsTab from "@/components/robots/LogsTab";
import ScheduleSettings from "@/components/robots/ScheduleSettings";
import RobotMainPanel from "@/components/robots/RobotMainPanel";
import RobotTrolleyPanel from "@/components/robots/RobotTrolleyPanel";
import { toast } from "sonner";
import { postData } from "@/services/postServices";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function AddRobotWithTrolley() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const type = location.state?.type || "withTrolley";
  const showTrolley = type === "withTrolley";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [robot, setRobot] = useState({
    RobotName: "",
    Voltage: 24,
    Cycles: 500,
    Status: "Running",
    Image: null,
    imagePreview: null,
    ActiveBtns: [],
    TrolleyStatus: "Running",
    carActiveBtns: [],
    schedule: { days: [], hour: 8, minute: 0 },
    mqttUrl: "mqtt://192.168.1.50:1883",
  });

  const [trolleyTab, setTrolleyTab] = useState("control");
  const [robotTab, setRobotTab] = useState("control");

  const handleSubmit = async () => {
    if (!robot.RobotName) {
      toast.warning("Please enter robot name");
      return;
    }

    const payload = {
      RobotName: robot.RobotName,
      Image: robot.Image || "",
      projectId: Number(id),
      mqttUrl: robot.mqttUrl,
      isTrolley: showTrolley,
      Sections: {
        main: {
          Voltage: Number(robot.Voltage),
          Cycles: Number(robot.Cycles),
          Status: robot.Status,
          ActiveBtns: robot.ActiveBtns.map((name, idx) => ({
            Name: name,
            id: (idx + 1).toString(),
          })),
          Topic_subscribe: "robot/main/in",
          Topic_main: "robot/main/out",
        },
        car: showTrolley
          ? {
              Voltage: Number(robot.Voltage),
              Cycles: Number(robot.Cycles),
              Status: robot.TrolleyStatus,
              ActiveBtns: robot.carActiveBtns.map((name, idx) => ({
                Name: name,
                id: (idx + 1).toString(),
              })),
              Topic_subscribe: "robot/car/in",
              Topic_main: "robot/car/out",
            }
          : {},
      },
    };

    try {
      const res = await postData(`${BASE_URL}/robots`, payload);
      toast.success("Robot saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save robot.");
    }
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

            <TabsHeader
              tabs={[
                { id: "control", label: "Control" },
                { id: "notifications", label: "Notifications" },
                { id: "logs", label: "Logs" },
              ]}
              active={trolleyTab}
              onChange={setTrolleyTab}
              accent="main"
            />

            <div className="mt-5 space-y-6">
              {trolleyTab === "control" && (
                <RobotTrolleyPanel
                  robot={robot}
                  setRobot={setRobot}
                  allButtons={ALL_BUTTONS}
                />
              )}
              {trolleyTab === "notifications" && <NotificationsTab />}
              {trolleyTab === "logs" && <LogsTab />}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-main-color">
                Schedule Settings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure robot and trolley schedule
              </p>
            </div>
          </div>

          <ScheduleSettings
            schedule={robot.schedule}
            setSchedule={(s) => setRobot((r) => ({ ...r, schedule: s }))}
          />
        </section>

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

          <TabsHeader
            tabs={[
              { id: "control", label: "Control" },
              { id: "notifications", label: "Notifications" },
              { id: "logs", label: "Logs" },
            ]}
            active={robotTab}
            onChange={setRobotTab}
            accent="main"
          />

          <div className="mt-5 space-y-6">
            {robotTab === "control" && (
              <RobotMainPanel
                robot={robot}
                setRobot={setRobot}
                allButtons={ALL_BUTTONS}
              />
            )}
            {robotTab === "notifications" && <NotificationsTab />}
            {robotTab === "logs" && <LogsTab />}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
