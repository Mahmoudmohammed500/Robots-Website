import React, { useState, useEffect } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function RobotTrolleyPanel({ 
  carData = {}, 
  updateCarSection = () => {}, 
  imagePreview = null,
  updateImage = () => {},
  allButtons = [] 
}) {
  const [customBtn, setCustomBtn] = useState("");

  useEffect(() => {
    console.log("=== RobotTrolleyPanel Data ===");
    console.log("carData:", carData);
    console.log("ActiveBtns:", carData.ActiveBtns);
    console.log("Voltage:", carData.Voltage);
    console.log("Cycles:", carData.Cycles);
    console.log("Status:", carData.Status);
  }, [carData]);

  const getAllActiveButtonNames = () => {
    if (!carData.ActiveBtns) {
      console.log("No ActiveBtns found in car");
      return [];
    }
    
    console.log("Raw car ActiveBtns:", carData.ActiveBtns);
    
    if (Array.isArray(carData.ActiveBtns)) {
      const names = carData.ActiveBtns.map(btn => {
        if (btn && typeof btn === 'object') {
          return btn.Name || btn.name || '';
        }
        return btn;
      }).filter(Boolean);
      
      console.log("Extracted car button names:", names);
      return names;
    }
    
    console.log("Car ActiveBtns is not an array");
    return [];
  };

  const getDisplayButtons = () => {
    const activeButtonNames = getAllActiveButtonNames();
    console.log("Final car display buttons:", activeButtonNames);
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
    toast.success("Trolley image uploaded successfully");
  };

  const toggleButton = (btnName) => {
    console.log("Toggling car button:", btnName);
    const currentActiveBtns = Array.isArray(carData.ActiveBtns) 
      ? [...carData.ActiveBtns] 
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
      toast.success(`Trolley button "${btnName}" removed`);
    } else {
      const newBtn = { 
        Name: btnName, 
        id: Date.now().toString(),
        section: "car"
      };
      newBtns = [...currentActiveBtns, newBtn];
      toast.success(`Trolley button "${btnName}" added`);
    }

    updateCarSection({ ActiveBtns: newBtns });
  };

  const addCustomButton = () => {
    const trimmed = customBtn.trim();
    if (!trimmed) {
      toast.warning("Please enter button name");
      return;
    }

    const currentActiveBtns = Array.isArray(carData.ActiveBtns) 
      ? [...carData.ActiveBtns] 
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
      section: "car"
    };
    
    const newActive = [...currentActiveBtns, newBtn];
    updateCarSection({ ActiveBtns: newActive });
    setCustomBtn("");
    toast.success("Trolley button added successfully");
  };

  const removeButton = (btnName) => {
    const currentActiveBtns = Array.isArray(carData.ActiveBtns) 
      ? [...carData.ActiveBtns] 
      : [];

    const newBtns = currentActiveBtns.filter((b) => {
      const existingBtnName = typeof b === 'string' ? b : (b.Name || b.name || '');
      return existingBtnName !== btnName;
    });
    
    updateCarSection({ ActiveBtns: newBtns });
    toast.success(`Trolley button "${btnName}" removed`);
  };

  const handleCarChange = (field, value) => {
    console.log(`Updating car ${field} to:`, value);
    updateCarSection({ [field]: value });
  };

  const displayButtons = getDisplayButtons();
  const availableButtons = getAvailableButtons();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 transition hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="relative group">
            <img
              src={imagePreview || "/assets/placeholder-trolley.jpg"}
              alt="trolley"
              className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
              onError={(e) => {
                e.target.src = "/assets/placeholder-trolley.jpg";
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
              value={carData.Status || "Stopped"}
              onChange={(e) => handleCarChange("Status", e.target.value)}
              className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
            >
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
              <option value="Idle">Idle</option>
            </select>
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