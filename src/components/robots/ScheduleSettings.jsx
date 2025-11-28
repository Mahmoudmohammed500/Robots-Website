import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { postData } from "@/services/postServices";
import { useParams } from "react-router-dom";


export default function ScheduleSettings({
  schedule = { days: [], hour: 8, minute: 0 },
  setSchedule = () => {},
  projectId, 
  publish, 
  topic 
}) {
  const { id: robotId } = useParams(); 
  const [saving, setSaving] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const size = 200;
  const radius = size / 2 - 20;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const toggleDay = (d) => {
    const next = schedule.days.includes(d)
      ? schedule.days.filter((x) => x !== d)
      : [...schedule.days, d];
    setSchedule({ ...schedule, days: next });
  };

  const handleClickClock = (e, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (type === "hour") {
      const newHour = Math.round((angle / 360) * 12) % 12 || 12;
      setSchedule({ ...schedule, hour: newHour });
    } else if (type === "minute") {
      let newMinute = Math.round(((angle / 360) * 60) / 5) * 5;
      if (newMinute === 60) newMinute = 0;
      setSchedule({ ...schedule, minute: newMinute });
    }
  };

  const getDaysAsBinaryString = () => {
    return days.map(day => schedule.days.includes(day) ? '1' : '0').join('_');
  };

  const handleSaveAndSendSchedule = async () => {
    if (!robotId) {
      alert("RobotId is missing!");
      return;
    }
    
    if (!schedule.days.length) {
      alert("Please select at least one day");
      return;
    }
    
    if (!projectId) {
      alert("ProjectId is missing!");
      return;
    }

    try {
      setSaving(true);

      if (publish && topic) {
        const timeString = `${String(schedule.hour).padStart(2, "0")}_${String(schedule.minute).padStart(2, "0")}`;
        const daysBinaryString = getDaysAsBinaryString();
        const message = `schedule_${timeString}_${daysBinaryString}`;
        
        publish(topic, message);
        console.log(`Schedule sent via MQTT: ${message} to topic: ${topic}`);
      }

      const dayFlags = days.map((d) => (schedule.days.includes(d) ? 1 : 0));
      const btnName = `schedule_${schedule.hour}_${schedule.minute}_${dayFlags.join("_")}`;

      const newButton = {
        BtnName: btnName,
        RobotId: parseInt(robotId),
        Color: "#0d9488",
        Operation: "/start",
        projectId: projectId, 
      };

      // await postData(`${BASE_URL}/buttons.php?section=car`, newButton);
      
      const successMessage = topic && publish 
        ? `Schedule saved as button: ${btnName} and sent via MQTT`
        : `Schedule saved as button: ${btnName}`;
      
      alert(successMessage);
      
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h4 className="text-md font-semibold text-main-color mb-3">Schedule</h4>

      {/* Days */}
      <div className="flex flex-wrap gap-2 mb-4">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => toggleDay(d)}
            className={`px-3 py-2 rounded-md text-sm ${
              schedule.days.includes(d)
                ? "bg-main-color text-white"
                : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex gap-6 items-center">
        <svg
          width={size}
          height={size}
          onClick={(e) => handleClickClock(e, "minute")}
          className="cursor-pointer"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 10}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          {hours.map((h) => {
            const angle = ((h % 12) / 12) * 2 * Math.PI - Math.PI / 2;
            const x = size / 2 + radius * 0.75 * Math.cos(angle);
            const y = size / 2 + radius * 0.75 * Math.sin(angle);
            return (
              <text
                key={h}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                onClick={(e) => handleClickClock(e, "hour")}
                className="cursor-pointer select-none"
              >
                {h}
              </text>
            );
          })}
          {minutes.map((m) => {
            const angle = (m / 60) * 2 * Math.PI - Math.PI / 2;
            const x1 = size / 2 + radius * 0.9 * Math.cos(angle);
            const y1 = size / 2 + radius * 0.9 * Math.sin(angle);
            const x2 = size / 2 + radius * Math.cos(angle);
            const y2 = size / 2 + radius * Math.sin(angle);
            return <line key={m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="1" />;
          })}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + radius * 0.5 * Math.cos(((schedule.hour % 12) / 12) * 2 * Math.PI - Math.PI / 2)}
            y2={size / 2 + radius * 0.5 * Math.sin(((schedule.hour % 12) / 12) * 2 * Math.PI - Math.PI / 2)}
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + radius * 0.8 * Math.cos((schedule.minute / 60) * 2 * Math.PI - Math.PI / 2)}
            y2={size / 2 + radius * 0.8 * Math.sin((schedule.minute / 60) * 2 * Math.PI - Math.PI / 2)}
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size / 2} r="4" fill="#000" />
        </svg>

        <div className="flex flex-col gap-2">
          <div className="text-gray-700 font-medium">
            Selected Time: {String(schedule.hour).padStart(2, "0")}:{String(schedule.minute).padStart(2, "0")}
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Hour:</label>
            <input
              type="number"
              min="0"
              max="23"
              value={schedule.hour}
              onChange={(e) =>
                setSchedule({ ...schedule, hour: Math.max(0, Math.min(23, Number(e.target.value))) })
              }
              className="border rounded-lg p-1 w-16"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Minute:</label>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={schedule.minute}
              onChange={(e) =>
                setSchedule({ ...schedule, minute: Math.max(0, Math.min(59, Number(e.target.value))) })
              }
              className="border rounded-lg p-1 w-16"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Current:{" "}
          <span className="font-medium">
            {schedule.days.length ? schedule.days.join(", ") : "—"} @ {String(schedule.hour).padStart(2, "0")}:
            {String(schedule.minute).padStart(2, "0")}
          </span>
          <br />
          <span className="text-xs text-gray-500">
            Binary: {getDaysAsBinaryString()} (Mon-Sun)
          </span>
        </div>
        <Button 
          onClick={handleSaveAndSendSchedule} 
          disabled={saving} 
          className="bg-second-color text-white"
        >
          {saving ? "Saving..." : "Schedule"}
        </Button>
      </div>
    </div>
  );
}