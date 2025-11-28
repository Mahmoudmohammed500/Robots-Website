import React from "react";
import { Upload, Power } from "lucide-react";

export default function RobotMainPanel({ 
  mainData = {}, 
  updateMainSection = () => {},
  robotName = "",
  updateRobotName = () => {},
  imagePreview = null,
  updateImage = () => {},
  mqttUrl = "",
  updateMqttUrl = () => {}
}) {
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
  };

  const handleMainChange = (field, value) => {
    updateMainSection({ [field]: value });
  };

  const toggleStatus = () => {
    const newStatus = mainData.Status === "Running" ? "Stopped" : "Running";
    handleMainChange("Status", newStatus);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 transition hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="relative group">
            <img
              src={imagePreview || "/assets/placeholder-robot.jpg"}
              alt="robot"
              className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-main-color text-white text-xs px-3 py-1 rounded-full cursor-pointer flex items-center gap-1">
              <Upload size={14} /> Upload
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Robot Name */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Robot Name</label>
            <input
              type="text"
              value={robotName}
              onChange={(e) => updateRobotName(e.target.value)}
              className="border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
              placeholder="Enter robot name"
            />
          </div>

          {/* MQTT URL */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">MQTT URL</label>
            <input
              type="text"
              value={mqttUrl}
              onChange={(e) => updateMqttUrl(e.target.value)}
              className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
              placeholder="Enter MQTT URL"
            />
          </div>

          {/* Voltage & Cycles */}
          {/* <EditableField 
            label="Voltage" 
            value={mainData.Voltage || ""} 
            onChange={(v) => handleMainChange("Voltage", v)} 
            type="number" 
            placeholder="Enter voltage"
          />
          <EditableField 
            label="Cycles" 
            value={mainData.Cycles || ""} 
            onChange={(v) => handleMainChange("Cycles", v)} 
            type="number" 
            placeholder="Enter cycles"
          /> */}

          {/* Topic Subscribe */}
          <EditableField 
            label="Topic Subscribe"
            value={mainData.Topic_subscribe || ""}
            onChange={(v) => handleMainChange("Topic_subscribe", v)}
            placeholder="Enter subscribe topic"
          />

          {/* Topic Main */}
          <EditableField 
            label="Topic Publisher "
            value={mainData.Topic_main || ""}
            onChange={(v) => handleMainChange("Topic_main", v)}
            placeholder="Enter publisher topic"
          />

          {/* Status */}
          <div className="flex flex-col">
            {/* <label className="text-xs text-gray-500 mb-1">Status</label>
            <div className="flex gap-2">
              <select
                value={mainData.Status || ""}
                onChange={(e) => handleMainChange("Status", e.target.value)}
                className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
              >
                <option value="">Select status</option>
                <option value="Running">Running</option>
                <option value="Stopped">Stopped</option>
                <option value="Idle">Idle</option>
              </select>
              <button
                onClick={toggleStatus}
                className={`px-3 rounded-lg text-white flex items-center justify-center ${
                  mainData.Status === "Running" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <Power size={16} />
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
      />
    </div>
  );
}