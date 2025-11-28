import React, { useEffect, useState } from "react";

export default function TrolleyPanelDetails({
  robotId,
  imgSrc = "/assets/placeholder-trolley.jpg",
  trolleyData = {},
  publish,
  client,
}) {
  const safeImgSrc =
    imgSrc && imgSrc.trim() !== "" ? imgSrc : "/assets/placeholder-trolley.jpg";
  const carSection = trolleyData?.Sections?.car || {};
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
    if (!carSection.ActiveBtns || !Array.isArray(carSection.ActiveBtns))
      return [];
    return carSection.ActiveBtns.map((btn) =>
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

  const handleButtonClick = (btnName) => {
    console.log("🛒 Trolley Button Clicked:", btnName);
    
    if (publish) {
      publish(btnName);
    } else {
      console.log(`Would publish trolley button: ${btnName}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 transition hover:shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <ViewField label="Voltage" value={carSection.Voltage ?? "-"} />
          <ViewField label="Cycles" value={carSection.Cycles ?? "-"} />
          <ViewField label="Status" value={carSection.Status || "-"} />
          <ViewField label="MQTT URL" value={trolleyData.mqttUrl || "-"} />
          <ViewField label="Topic Publisher" value={carSection.Topic_main || "-"} />
          <ViewField
            label="Topic Subscribe"
            value={carSection.Topic_subscribe || "-"}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border select-none cursor-pointer hover:opacity-90 transition-opacity"
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
                <div className="text-gray-500 italic text-sm">
                  No active buttons
                </div>
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
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <div className="border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg p-2.5 cursor-default select-none">
        {value}
      </div>
    </div>
  );
}