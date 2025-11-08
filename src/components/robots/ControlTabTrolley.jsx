import React, { useState, useEffect } from "react";
import {
  Link2,
  Unlink2,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";

export default function ControlTab({ data = {}, setData = () => {} }) {
  // --- TROLLEY STATES ---
  const [trolleyStatus, setTrolleyStatus] = useState(
    data.trolley?.Status || "Detached"
  );
  const [loadWeight, setLoadWeight] = useState(data.trolley?.LoadWeight || 0);

  // --- ROBOT STATES ---
  const [robotStatus, setRobotStatus] = useState(
    data.robot?.Status || "Idle"
  );
  const [speed, setSpeed] = useState(data.robot?.Speed || 0);
  const [direction, setDirection] = useState(
    data.robot?.Direction || "Forward"
  );

  useEffect(() => {
    setTrolleyStatus(data.trolley?.Status || "Detached");
    setLoadWeight(data.trolley?.LoadWeight || 0);
    setRobotStatus(data.robot?.Status || "Idle");
    setSpeed(data.robot?.Speed || 0);
    setDirection(data.robot?.Direction || "Forward");
  }, [data]);

  // --- HANDLERS ---
  const handleTrolleyAction = (type) => {
    const newStatus = type === "attach" ? "Attached" : "Detached";
    setTrolleyStatus(newStatus);
    setData((prev) => ({
      ...prev,
      trolley: { ...prev.trolley, Status: newStatus },
    }));
  };

  const handleRobotAction = (type) => {
    let newStatus = robotStatus;
    if (type === "start") newStatus = "Running";
    if (type === "stop") newStatus = "Stopped";
    if (type === "reset") newStatus = "Idle";

    setRobotStatus(newStatus);
    setData((prev) => ({
      ...prev,
      robot: { ...prev.robot, Status: newStatus },
    }));
  };

  const handleSpeedChange = (val) => {
    setSpeed(val);
    setData((prev) => ({
      ...prev,
      robot: { ...prev.robot, Speed: val },
    }));
  };

  const handleDirectionChange = (val) => {
    setDirection(val);
    setData((prev) => ({
      ...prev,
      robot: { ...prev.robot, Direction: val },
    }));
  };

  return (
    <div className="space-y-6">
      {/* ---------- TROLLEY CONTROL ---------- */}
      <div className="p-5 bg-white border rounded-2xl shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Trolley Control</h3>

        {/* Attach / Detach */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleTrolleyAction("attach")}
            className="flex items-center gap-2 bg-main-color text-white px-4 py-2 rounded-xl text-sm"
          >
            <Link2 size={16} /> Attach
          </button>
          <button
            onClick={() => handleTrolleyAction("detach")}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Unlink2 size={16} /> Detach
          </button>
        </div>

        {/* Load Weight */}
        <div>
          <label className="text-xs text-gray-500">Load Weight (kg)</label>
          <input
            type="number"
            value={loadWeight}
            onChange={(e) => setLoadWeight(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Status: <span className="font-medium">{trolleyStatus}</span>
        </div>
      </div>

      {/* ---------- ROBOT CONTROL UNDER IT ---------- */}
      <div className="p-5 bg-white border rounded-2xl shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Robot Control</h3>

        {/* Start / Stop / Reset */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => handleRobotAction("start")}
            className="flex items-center gap-2 bg-main-color text-white px-4 py-2 rounded-xl text-sm"
          >
            <Play size={16} /> Start
          </button>
          <button
            onClick={() => handleRobotAction("stop")}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
          >
            <Square size={16} /> Stop
          </button>
          <button
            onClick={() => handleRobotAction("reset")}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Speed & Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Speed</label>
            <input
              type="number"
              value={speed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Direction</label>
            <select
              value={direction}
              onChange={(e) => handleDirectionChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            >
              <option value="Forward">Forward</option>
              <option value="Backward">Backward</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Status: <span className="font-medium">{robotStatus}</span>
        </div>
      </div>
    </div>
  );
}
