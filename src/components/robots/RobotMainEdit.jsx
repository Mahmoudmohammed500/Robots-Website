import React, { useState, useEffect } from "react";
import { Upload, Power, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    console.log("=== RobotMainPanel Data ===");
    console.log("mainData:", mainData);
    console.log("robotName:", robotName);
    console.log("ActiveBtns:", mainData.ActiveBtns);
    console.log("Voltage:", mainData.Voltage);
    console.log("Cycles:", mainData.Cycles);
    console.log("Status:", mainData.Status);
  }, [mainData, robotName]);

  const getAllActiveButtonNames = () => {
    if (!mainData.ActiveBtns) {
      console.log("No ActiveBtns found");
      return [];
    }
    
    console.log("Raw ActiveBtns:", mainData.ActiveBtns);
    
    if (Array.isArray(mainData.ActiveBtns)) {
      const names = mainData.ActiveBtns.map(btn => {
        if (btn && typeof btn === 'object') {
          return btn.Name || btn.name || '';
        }
        return btn;
      }).filter(Boolean);
      
      console.log("Extracted button names:", names);
      return names;
    }
    
    console.log("ActiveBtns is not an array");
    return [];
  };

  const getDisplayButtons = () => {
    const activeButtonNames = getAllActiveButtonNames();
    console.log("Final display buttons:", activeButtonNames);
    return activeButtonNames;
  };

  const getAvailableButtons = () => {
    const activeButtonNames = getAllActiveButtonNames();
    return allButtons.filter(btn => !activeButtonNames.includes(btn));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateImage(file, url);
    toast.success("Image uploaded successfully");
  };

  const handleMainChange = (field, value) => {
    console.log(`Updating main ${field} to:`, value);
    updateMainSection({ [field]: value });
  };

  const toggleButton = (btnName) => {
    console.log("Toggling button:", btnName);
    const currentActiveBtns = Array.isArray(mainData.ActiveBtns) 
      ? [...mainData.ActiveBtns] 
      : [];

    const exists = currentActiveBtns.some((b) => {
      const existingBtnName = typeof b === 'string' ? b : (b.Name || b.name || '');
      return existingBtnName === btnName;
    });
    
    let newBtns;
    if (exists) {
      newBtns = currentActiveBtns.filter((b) => {
        const existingBtnName = typeof b === 'string' ? b : (b.Name || b.name || '');
        return existingBtnName !== btnName;
      });
      toast.success(`Button "${btnName}" removed`);
    } else {
      const newBtn = { 
        Name: btnName, 
        id: Date.now().toString(),
        section: "main"
      };
      newBtns = [...currentActiveBtns, newBtn];
      toast.success(`Button "${btnName}" added`);
    }
    
    updateMainSection({ ActiveBtns: newBtns });
  };

  const addCustomButton = () => {
    const trimmed = customBtn.trim();
    if (!trimmed) {
      toast.warning("Please enter button name");
      return;
    }

    const currentActiveBtns = Array.isArray(mainData.ActiveBtns) 
      ? [...mainData.ActiveBtns] 
      : [];
    
    const exists = currentActiveBtns.some((b) => {
      const existingBtnName = typeof b === 'string' ? b : (b.Name || b.name || '');
      return existingBtnName === trimmed;
    });
    
    if (exists) {
      toast.warning("Button already exists");
      return;
    }

    const newBtn = { 
      Name: trimmed, 
      id: Date.now().toString(),
      section: "main"
    };
    
    const newActive = [...currentActiveBtns, newBtn];
    updateMainSection({ ActiveBtns: newActive });
    setCustomBtn("");
    toast.success("Button added successfully");
  };

  const removeButton = (btnName) => {
    const currentActiveBtns = Array.isArray(mainData.ActiveBtns) 
      ? [...mainData.ActiveBtns] 
      : [];

    const newBtns = currentActiveBtns.filter((b) => {
      const existingBtnName = typeof b === 'string' ? b : (b.Name || b.name || '');
      return existingBtnName !== btnName;
    });
    
    updateMainSection({ ActiveBtns: newBtns });
    toast.success(`Button "${btnName}" removed`);
  };

  const toggleStatus = () => {
    const newStatus = mainData.Status === "Running" ? "Stopped" : "Running";
    handleMainChange("Status", newStatus);
  };

  const displayButtons = getDisplayButtons();
  const availableButtons = getAvailableButtons();

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
              onError={(e) => {
                e.target.src = "/assets/placeholder-robot.jpg";
              }}
            />
            <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-main-color text-white text-xs px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 hover:bg-main-color-dark transition-colors">
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

        {/* Fields */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Robot Name */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Robot Name</label>
            <input
              type="text"
              value={robotName || ""}
              onChange={(e) => updateRobotName(e.target.value)}
              className="border border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
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
                value={mainData.Status || "Stopped"}
                onChange={(e) => handleMainChange("Status", e.target.value)}
                className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
              >
                <option value="Running">Running</option>
                <option value="Stopped">Stopped</option>
                <option value="Idle">Idle</option>
              </select>
              <button
                onClick={toggleStatus}
                className={`px-3 rounded-lg text-white flex items-center justify-center transition-colors ${
                  mainData.Status === "Running" 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <Power size={16} />
              </button>
            </div>
          </div>

          {/* Available Buttons */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Available Buttons</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableButtons.map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => toggleButton(btn)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 hover:border-main-color transition-colors flex items-center gap-2"
                >
                  {btn} +
                </button>
              ))}
              {availableButtons.length === 0 && (
                <div className="text-gray-500 italic text-sm">All predefined buttons are active</div>
              )}
            </div>
          </div>

          {/* Active Buttons Section */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Active Buttons</label>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {displayButtons.map((btn) => (
                  <div
                    key={btn}
                    className="flex items-center gap-2 bg-main-color text-white px-4 py-2 rounded-xl border border-main-color"
                  >
                    <span>{btn} ✓</span>
                    <button
                      type="button"
                      onClick={() => removeButton(btn)}
                      className="text-white hover:text-red-200 transition-colors"
                      title="Remove button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {displayButtons.length === 0 && (
                <div className="text-gray-500 italic text-sm">No active buttons</div>
              )}
            </div>
          </div>

          {/* Add Custom Button */}
          <div className="col-span-2 flex gap-2 mt-2">
            <input
              type="text"
              value={customBtn}
              onChange={(e) => setCustomBtn(e.target.value)}
              placeholder="Add new custom button..."
              className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addCustomButton()}
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
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
      />
    </div>
  );
}