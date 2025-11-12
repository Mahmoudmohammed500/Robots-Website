import React from "react";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function RobotMainPanelView({ robot, setRobot, allButtons = ALL_BUTTONS }) {
  
  const mainSection = robot?.Sections?.main || {};
  
  const getActiveButtons = () => {
    if (!mainSection.ActiveBtns || !Array.isArray(mainSection.ActiveBtns)) {
      return [];
    }
    
    return mainSection.ActiveBtns.map(btn => {
      if (typeof btn === 'object' && btn !== null) {
        return btn.Name || btn.name || '';
      }
      return btn;
    }).filter(Boolean);
  };

  const activeButtons = getActiveButtons();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* ---- Robot Image ---- */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <img
            src={robot?.Image || "/assets/placeholder-robot.jpg"}
            alt={robot?.RobotName || "Robot"}
            className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
          />
        </div>

        {/* ---- Main Section Details ---- */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <ViewField label="Robot Name" value={robot?.RobotName || "-"} />
          <ViewField label="Voltage" value={mainSection.Voltage ?? "-"} />
          <ViewField label="Cycles" value={mainSection.Cycles ?? "-"} />
          <ViewField label="Status" value={mainSection.Status || "-"} />
          <ViewField label="Robot ID" value={robot?.id || "-"} />
          
          {/* MQTT Fields */}
          <ViewField label="MQTT URL" value={robot?.mqttUrl || "-"} />
          <ViewField label="Topic Main" value={mainSection.Topic_main || "-"} />
          <ViewField label="Topic Subscribe" value={mainSection.Topic_subscribe || "-"} />
          
          

          {/* Active Buttons */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Active Buttons</label>
            <div className="flex flex-wrap gap-2">
              {activeButtons.map((btn) => (
                <div
                  key={btn}
                  className="px-4 py-2 rounded-xl font-medium border bg-main-color text-white border-main-color cursor-default select-none"
                >
                  {btn} ✓
                </div>
              ))}
              {activeButtons.length === 0 && (
                <div className="text-gray-500 italic">No active buttons</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <div className="border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg p-2.5 cursor-default select-none">
        {value ?? "-"}
      </div>
    </div>
  );
}