import React, { useState } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";

export default function RobotMainPanel({ 
  mainData = {}, 
  updateMainSection = () => {},
  robotName = "",
  updateRobotName = () => {},
  imagePreview = null,
  updateImage = () => {},
  fixedFields = false
}) {
  const [showMqttPassword, setShowMqttPassword] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
  };

  const handleMainChange = (field, value) => {
    updateMainSection({ [field]: value });
  };

  const toggleMqttPasswordVisibility = () => {
    setShowMqttPassword(!showMqttPassword);
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

          {/* MQTT URL for Robot */}
          <EditableField 
            label="MQTT URL"
            value={mainData.mqttUrl || ""}
            onChange={(v) => handleMainChange("mqttUrl", v)}
            placeholder="Enter MQTT URL for robot"
          />

          {/* MQTT Username for Robot */}
          <EditableField 
            label="MQTT Username"
            value={mainData.mqttUsername || ""}
            onChange={(v) => handleMainChange("mqttUsername", v)}
            placeholder="Enter MQTT username for robot"
          />

          {/* MQTT Password for Robot with Eye Icon */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">MQTT Password</label>
            <div className="relative">
              <input
                type={showMqttPassword ? "text" : "password"}
                value={mainData.mqttPassword || ""}
                onChange={(e) => handleMainChange("mqttPassword", e.target.value)}
                placeholder="Enter MQTT password for robot"
                className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color w-full pr-10"
              />
              <button
                type="button"
                onClick={toggleMqttPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showMqttPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Topic Subscribe */}
          <EditableField 
            label="Topic Subscribe"
            value={mainData.Topic_subscribe || ""}
            onChange={(v) => handleMainChange("Topic_subscribe", v)}
            placeholder="Enter subscribe topic"
          />

          {/* Topic Main */}
          <EditableField 
            label="Topic Publisher"
            value={mainData.Topic_main || ""}
            onChange={(v) => handleMainChange("Topic_main", v)}
            placeholder="Enter publisher topic"
          />
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