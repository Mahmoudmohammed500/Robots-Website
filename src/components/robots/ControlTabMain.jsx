import React, { useState, useEffect } from "react";
import { Play, Square, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";

export default function ControlTabMain({ robot = {}, setRobot = () => {} }) {
  const [status, setStatus] = useState(robot.Status || "Idle");
  const [speed, setSpeed] = useState(robot.Speed || 0);
  const [direction, setDirection] = useState(robot.Direction || "Forward");

  useEffect(() => {
    setStatus(robot.Status || "Idle");
    setSpeed(robot.Speed || 0);
    setDirection(robot.Direction || "Forward");
  }, [robot]);

  const handleAction = (type) => {
    if (type === "start") setStatus("Running");
    if (type === "stop") setStatus("Stopped");
    if (type === "reset") setStatus("Idle");
    setRobot({ ...robot, Status: status });
  };

  const handleSpeedChange = (e) => {
    const val = e.target.value;
    setSpeed(val);
    setRobot({ ...robot, Speed: val });
  };

  return (
    <div className="p-5 bg-white border rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3">Main Robot Control</h3>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => handleAction("start")}
          className="flex items-center gap-2 bg-main-color text-white px-4 py-2 rounded-xl text-sm"
        >
          <Play size={16} /> Start
        </button>
        <button
          onClick={() => handleAction("stop")}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
        >
          <Square size={16} /> Stop
        </button>
        <button
          onClick={() => handleAction("reset")}
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
            onChange={handleSpeedChange}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          >
            <option value="Forward">Forward</option>
            <option value="Backward">Backward</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Status: <span className="font-medium">{status}</span>
      </div>
    </div>
  );
}
