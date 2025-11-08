// src/components/robots/ScheduleSettings.jsx
import React from "react";
import { Button } from "@/components/ui/button";

/**
 * ScheduleSettings
 * props:
 *  - schedule { days: [], hour: number, minute: number }
 *  - setSchedule(fn)
 */
export default function ScheduleSettings({ schedule = { days: [], hour: 8, minute: 0 }, setSchedule = () => {} }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (d) => {
    const next = schedule.days.includes(d) ? schedule.days.filter(x => x !== d) : [...schedule.days, d];
    setSchedule({ ...schedule, days: next });
  };

  const setHour = (v) => {
    let n = parseInt(v, 10);
    if (Number.isNaN(n)) n = 0;
    n = Math.max(0, Math.min(23, n));
    setSchedule({ ...schedule, hour: n });
  };

  const setMinute = (m) => setSchedule({ ...schedule, minute: Number(m) });

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h4 className="text-md font-semibold text-main-color mb-3">Schedule</h4>

      <div className="flex flex-wrap gap-2 mb-4">
        {days.map(d => (
          <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-2 rounded-md text-sm ${schedule.days.includes(d) ? "bg-main-color text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm text-gray-600">Hour</label>
          <input type="number" min="0" max="23" value={String(schedule.hour)} onChange={(e) => setHour(e.target.value)} className="w-24 border rounded-lg p-2" />
        </div>

        <div>
          <label className="text-sm text-gray-600">Minute</label>
          <select value={schedule.minute} onChange={(e) => setMinute(e.target.value)} className="border rounded-lg p-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const val = i * 5;
              return <option key={val} value={val}>{String(val).padStart(2, "0")}</option>;
            })}
          </select>
        </div>

        <div className="text-sm text-gray-500">(step 5 min)</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Current: <span className="font-medium">{(schedule.days.length ? schedule.days.join(", ") : "—")} @ {String(schedule.hour).padStart(2, "0")}:{String(schedule.minute).padStart(2, "0")}</span></div>
        <Button className="bg-second-color text-white">Save schedule</Button>
      </div>
    </div>
  );
}
