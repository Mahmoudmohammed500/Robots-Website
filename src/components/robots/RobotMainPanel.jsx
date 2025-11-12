import React, { useState } from "react";
import { Upload, Power, Plus } from "lucide-react";

export default function RobotMainPanel({ 
  mainData = {}, 
  updateMainSection = () => {},
  robotName = "",
  updateRobotName = () => {},
  imagePreview = null,
  updateImage = () => {},
  allButtons = []
}) {
  const [customBtn, setCustomBtn] = useState("");
  const [buttons, setButtons] = useState([...allButtons]);

  console.log("Current mainData in panel:", mainData); // Debug

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
  };

  const handleMainChange = (field, value) => {
    console.log(`Updating main ${field} to:`, value);
    updateMainSection({ [field]: value });
  };

  const toggleButton = (btnName) => {
    console.log("Toggling button:", btnName);
    const currentActiveBtns = Array.isArray(mainData.ActiveBtns) ? [...mainData.ActiveBtns] : [];
    const exists = currentActiveBtns.some((b) => b.Name === btnName);
    
    let newBtns;
    if (exists) {
      newBtns = currentActiveBtns.filter((b) => b.Name !== btnName);
    } else {
      newBtns = [...currentActiveBtns, { 
        Name: btnName, 
        id: Date.now().toString(),
        section: "main"
      }];
    }
    
    console.log("New buttons:", newBtns);
    updateMainSection({ ActiveBtns: newBtns });
  };

  const addCustomButton = () => {
    const trimmed = customBtn.trim();
    if (!trimmed || buttons.includes(trimmed)) return;

    const newBtn = { 
      Name: trimmed, 
      id: Date.now().toString(),
      section: "main"
    };
    
    setButtons((prev) => [...prev, trimmed]);
    
    const currentActiveBtns = Array.isArray(mainData.ActiveBtns) ? [...mainData.ActiveBtns] : [];
    const newActive = [...currentActiveBtns, newBtn];
    
    updateMainSection({ ActiveBtns: newActive });
    setCustomBtn("");
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

          {/* Voltage & Cycles */}
          <EditableField 
            label="Voltage" 
            value={mainData.Voltage || ""} 
            onChange={(v) => handleMainChange("Voltage", v)} 
            type="number" 
          />
          <EditableField 
            label="Cycles" 
            value={mainData.Cycles || ""} 
            onChange={(v) => handleMainChange("Cycles", v)} 
            type="number" 
          />

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <div className="flex gap-2">
              <select
                value={mainData.Status || "Idle"}
                onChange={(e) => handleMainChange("Status", e.target.value)}
                className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
              >
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
            </div>
          </div>

          {/* Active Buttons */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Active Buttons</label>
            <div className="flex flex-wrap gap-2">
              {buttons.map((btn) => {
                const isActive = Array.isArray(mainData.ActiveBtns) && 
                  mainData.ActiveBtns.some((b) => b.Name === btn);
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => toggleButton(btn)}
                    className={`px-4 py-2 rounded-xl border transition-colors ${
                      isActive 
                        ? "bg-main-color text-white border-main-color" 
                        : "bg-white text-gray-700 border-gray-300 hover:border-main-color"
                    }`}
                  >
                    {btn} {isActive && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Button */}
          <div className="col-span-2 flex gap-2 mt-2">
            <input
              type="text"
              value={customBtn}
              onChange={(e) => setCustomBtn(e.target.value)}
              placeholder="Add new button..."
              className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
            />
            <button
              onClick={addCustomButton}
              className="bg-main-color text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-main-color-dark transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
      />
    </div>
  );
}