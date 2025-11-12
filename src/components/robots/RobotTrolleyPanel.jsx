import React, { useState } from "react";
import { Upload, Plus } from "lucide-react";

export default function RobotTrolleyPanel({ 
  carData = {}, 
  updateCarSection = () => {}, 
  imagePreview = null,
  updateImage = () => {},
  allButtons = [] 
}) {
  const [customBtn, setCustomBtn] = useState("");
  const [buttons, setButtons] = useState([...allButtons]);

  console.log("Current carData in panel:", carData); // Debug

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
  };

  const toggleButton = (btnName) => {
    console.log("Toggling car button:", btnName);
    const currentActiveBtns = Array.isArray(carData.ActiveBtns) ? [...carData.ActiveBtns] : [];
    const exists = currentActiveBtns.some((b) => b.Name === btnName);
    
    let newBtns;
    if (exists) {
      newBtns = currentActiveBtns.filter((b) => b.Name !== btnName);
    } else {
      newBtns = [...currentActiveBtns, { 
        Name: btnName, 
        id: Date.now().toString(),
        section: "car"
      }];
    }

    console.log("New car buttons:", newBtns);
    updateCarSection({ ActiveBtns: newBtns });
  };

  const addCustomButton = () => {
    const trimmed = customBtn.trim();
    if (!trimmed || buttons.includes(trimmed)) return;

    const newBtn = { 
      Name: trimmed, 
      id: Date.now().toString(),
      section: "car"
    };
    
    setButtons((prev) => [...prev, trimmed]);

    const currentActiveBtns = Array.isArray(carData.ActiveBtns) ? [...carData.ActiveBtns] : [];
    const newActive = [...currentActiveBtns, newBtn];
    
    updateCarSection({ ActiveBtns: newActive });
    setCustomBtn("");
  };

  const handleCarChange = (field, value) => {
    console.log(`Updating car ${field} to:`, value);
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
          />
          <EditableField
            label="Cycles"
            value={carData.Cycles || ""}
            onChange={(v) => handleCarChange("Cycles", v)}
            type="number"
          />

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <select
              value={carData.Status || "Running"}
              onChange={(e) => handleCarChange("Status", e.target.value)}
              className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color"
            >
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
              <option value="Idle">Idle</option>
            </select>
          </div>

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

          {/* Active Buttons */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Active Buttons</label>
            <div className="flex flex-wrap gap-2">
              {buttons.map((btn) => {
                const isActive = Array.isArray(carData.ActiveBtns) && 
                  carData.ActiveBtns.some((b) => b.Name === btn);
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