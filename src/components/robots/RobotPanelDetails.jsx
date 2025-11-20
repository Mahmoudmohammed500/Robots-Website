import React, { useEffect, useState } from "react";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function RobotMainPanelView({
  robot,
  setRobot,
  allButtons = ALL_BUTTONS,
  publish,
  client,
}) {
  const mainSection = robot?.Sections?.main || {};
  const [buttonsWithColors, setButtonsWithColors] = useState([]);
  const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

  useEffect(() => {
    const fetchButtons = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buttons`);
        const data = await res.json();
        setButtonsWithColors(data || []);
      } catch (err) {
        console.error("Failed to fetch buttons", err);
      }
    };
    fetchButtons();
  }, []);

  const getActiveButtons = () => {
    if (!mainSection.ActiveBtns || !Array.isArray(mainSection.ActiveBtns))
      return [];
    return mainSection.ActiveBtns.map((btn) =>
      typeof btn === "object" && btn !== null ? btn.Name || btn.name || "" : btn
    ).filter(Boolean);
  };

  const activeButtons = getActiveButtons();

  const getButtonColor = (btnName) => {
    const btnData = buttonsWithColors.find(
      (b) => b.BtnName?.toLowerCase() === btnName.toLowerCase()
    );
    return btnData?.Color || "#4F46E5";
  };

  const getButtonOperation = (btnName) => {
    const btnData = buttonsWithColors.find(
      (b) => b.BtnName?.toLowerCase() === btnName.toLowerCase()
    );
    return btnData?.Operation || btnName; // Default to button name if no operation found
  };

  const handleButtonClick = (btnName) => {
    const topic = mainSection.Topic_main;
    if (!topic) {
      console.error("No topic found for main section");
      return;
    }
    const operation = getButtonOperation(btnName);

    if (publish) {
      publish(topic, operation);
    } else {
      console.log(`Would publish to ${topic}: ${operation}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <img
            src={
              robot?.Image && robot.Image !== "Array"
                ? `${UPLOADS_URL}/${robot.Image}?t=${Date.now()}`
                : RobotImg
            }
            alt="Robot"
            className="h-40 w-40 object-cover rounded-xl border shadow-md"
          />
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <ViewField label="Robot Name" value={robot?.RobotName || "-"} />
          <ViewField label="Voltage" value={mainSection.Voltage ?? "-"} />
          <ViewField label="Cycles" value={mainSection.Cycles ?? "-"} />
          <ViewField label="Status" value={mainSection.Status || "-"} />
          <ViewField label="Robot ID" value={robot?.id || "-"} />
          <ViewField label="MQTT URL" value={robot?.mqttUrl || "-"} />
          <ViewField label="Topic Main" value={mainSection.Topic_main || "-"} />
          <ViewField
            label="Topic Subscribe"
            value={mainSection.Topic_subscribe || "-"}
          />

          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">
              Active Buttons
            </label>
            <div className="flex flex-wrap gap-2">
              {activeButtons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className="px-4 py-2 rounded-xl font-medium border cursor-pointer select-none hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: getButtonColor(btn),
                    borderColor: getButtonColor(btn),
                    color: "#fff",
                  }}
                >
                  {btn} ✓
                </button>
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
