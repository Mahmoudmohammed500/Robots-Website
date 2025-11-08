import React from "react";
import { Upload } from "lucide-react";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function RobotTrolleyPanel({ robot = {}, setRobot = () => {}, imgSrc }) {
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRobot((r) => ({ ...r, Image: file, imagePreview: url }));
  };

  const handleChange = (field, value) => {
    setRobot((r) => ({ ...r, [field]: value }));
  };

  const toggleButton = (btnName) => {
    setRobot((r) => {
      const exists = r.ActiveBtns.some((b) => b.Name === btnName);
      const newBtns = exists
        ? r.ActiveBtns.filter((b) => b.Name !== btnName)
        : [...r.ActiveBtns, { Name: btnName, id: r.ActiveBtns.length + 1 }];
      return { ...r, ActiveBtns: newBtns };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 transition hover:shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="relative group">
            <img
              src={robot.imagePreview || imgSrc || "/assets/placeholder-trolley.jpg"}
              alt="trolley"
              className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition"
            />
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-main-color text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 opacity-90 hover:opacity-100 cursor-pointer transition">
              <Upload size={14} /> Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <EditableField
            label="Voltage"
            value={robot.Voltage ?? ""}
            onChange={(val) => handleChange("Voltage", val)}
            type="number"
          />
          <EditableField
            label="Cycles"
            value={robot.Cycles ?? ""}
            onChange={(val) => handleChange("Cycles", val)}
            type="number"
          />

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <select
              value={robot.Status || "Running"}
              onChange={(e) => handleChange("Status", e.target.value)}
              className="border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main-color)]"
            >
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
              <option value="Idle">Idle</option>
            </select>
          </div>

          {/* Active Buttons */}
          <div className="col-span-2 flex flex-wrap gap-2 mt-2">
            {ALL_BUTTONS.map((btn) => {
              const isActive = robot.ActiveBtns.some((b) => b.Name === btn);
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => toggleButton(btn)}
                  className={`px-4 py-2 rounded-xl font-medium border ${
                    isActive
                      ? "bg-main-color text-white border-main-color"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-main-color hover:text-white"
                  }`}
                >
                  {btn} {isActive && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main-color)]"
      />
    </div>
  );
}
