import React from "react";
import { Upload } from "lucide-react";

export default function RobotTrolleyPanel({ 
  carData = {}, 
  updateCarSection = () => {}, 
  imagePreview = null,
  updateImage = () => {}
}) {
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
  };

  const handleCarChange = (field, value) => {
    updateCarSection({ [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 transition hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="relative group">
            <img
              src={imagePreview || "/assets/placeholder-trolley.jpg"}
              alt="trolley"
              className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
            />
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-main-color text-white text-xs px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 hover:bg-main-color-dark transition-colors">
              <Upload size={14} /> Upload
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Voltage & Cycles */}
          <EditableField
            label="Voltage"
            value={carData.Voltage || ""}
            onChange={(v) => handleCarChange("Voltage", v)}
            type="number"
            placeholder="Enter voltage"
          />
          <EditableField
            label="Cycles"
            value={carData.Cycles || ""}
            onChange={(v) => handleCarChange("Cycles", v)}
            type="number"
            placeholder="Enter cycles"
          />

          {/* Topic Subscribe */}
          <EditableField
            label="Topic Subscribe"
            value={carData.Topic_subscribe || ""}
            onChange={(v) => handleCarChange("Topic_subscribe", v)}
            placeholder="Enter subscribe topic"
          />

          {/* Topic Main */}
          <EditableField
            label="Topic Main"
            value={carData.Topic_main || ""}
            onChange={(v) => handleCarChange("Topic_main", v)}
            placeholder="Enter main topic"
          />

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <select
              value={carData.Status || ""}
              onChange={(e) => handleCarChange("Status", e.target.value)}
              className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
            >
              <option value="">Select status</option>
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
              <option value="Idle">Idle</option>
            </select>
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