import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function RobotMainPanelView({ robot, setRobot, allButtons = ALL_BUTTONS }) {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchRobot = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/robots.php/${id}`);
        const data = await res.json();
        setRobot(data);
      } catch (err) {
        console.error("Failed to fetch robot:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!robot) {
      fetchRobot();
    } else {
      setLoading(false);
    }
  }, [id, robot, setRobot]);

  const getActiveButtons = () => {
    if (!robot || !robot.Sections?.main?.ActiveBtns) return allButtons;
    
    const activeBtns = Array.isArray(robot.Sections.main.ActiveBtns) 
      ? robot.Sections.main.ActiveBtns 
      : (typeof robot.Sections.main.ActiveBtns === "string" ? JSON.parse(robot.Sections.main.ActiveBtns || "[]") : []);

    const activeStaticButtons = allButtons.filter(staticBtn => {
      return activeBtns.some(activeBtn => 
        activeBtn && 
        typeof activeBtn.Name === "string" && 
        activeBtn.Name.toLowerCase() === staticBtn.toLowerCase()
      );
    });

    const newActiveButtons = activeBtns
      .filter(activeBtn => 
        activeBtn && 
        typeof activeBtn.Name === "string" &&
        !allButtons.some(staticBtn => 
          staticBtn.toLowerCase() === activeBtn.Name.toLowerCase()
        )
      )
      .map(activeBtn => activeBtn.Name);

    return [...new Set([...activeStaticButtons, ...newActiveButtons])];
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!robot) return <p className="text-center py-10 text-red-500">Robot not found.</p>;

  const mainSection = robot.Sections?.main || {};
  const activeButtons = getActiveButtons();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* ---- Robot Image ---- */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <img
            src={robot.Image || "/assets/placeholder-robot.jpg"}
            alt={robot.RobotName || "Robot"}
            className="w-48 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
          />
        </div>

        {/* ---- Main Section Details ---- */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <ViewField label="Robot Name" value={robot.RobotName || "-"} />
          <ViewField label="Voltage" value={mainSection.Voltage ?? "-"} />
          <ViewField label="Cycles" value={mainSection.Cycles ?? "-"} />
          <ViewField label="Status" value={mainSection.Status || "-"} />
          <ViewField label="Robot ID" value={robot.id || id} />

          {/* Active Buttons */}
          <div className="col-span-2 flex flex-wrap gap-2 mt-2">
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