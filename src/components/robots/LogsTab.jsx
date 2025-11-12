// src/components/robots/LogsTabView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { Trash2, X, Loader } from "lucide-react";

export default function LogsTabView({ sectionName }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [deviceData, setDeviceData] = useState(null);

  const params = useParams();
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  let deviceType = null;
  let deviceId = null;

  if (pathParts.includes("robotDetails")) {
    deviceType = "robot";
    deviceId = pathParts[pathParts.indexOf("robotDetails") + 1];
  } else if (pathParts.includes("trolleyDetails")) {
    deviceType = "trolley";
    deviceId = pathParts[pathParts.indexOf("trolleyDetails") + 1];
  } else if (params.id) {
    deviceId = params.id;
    deviceType = "robot";
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!deviceId) {
      setError("Cannot determine device ID from URL");
      setLoading(false);
      return;
    }
    fetchLogsAndDevice();
  }, [deviceId, deviceType, sectionName]);

  // 🔍 استخراج أي ID متاح للـ log
  const extractLogId = (log) => {
    const fields = ["id", "log_id", "logId", "ID", "Id"];
    return (
      fields.find(
        (f) => log[f] !== undefined && log[f] !== null && log[f] !== ""
      ) || null
    );
  };

  // 🔍 فلترة الـ logs حسب القسم الحالي + آخر 50 + أحدث واحد أولاً
  const filterLogsBySection = (logsData, device, sectionName) => {
    if (!device?.Sections?.[sectionName] || !Array.isArray(logsData)) return [];
    const topic = device.Sections[sectionName].Topic_main;

    // فلترة حسب topic
    const filtered = logsData.filter((log) => log.topic_main === topic);

    // ترتيب حسب التاريخ والوقت من الأقدم للأحدث
    const sorted = filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB; // تصاعدي
    });

    // أخذ آخر 50 log
    const lastFifty = sorted.slice(-50);

    // عكس الترتيب بحيث أحدث log يظهر أول
    return lastFifty.reverse();
  };

  // 📥 تحميل كل الـ logs وبيانات الجهاز
  const fetchLogsAndDevice = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب كل الـ logs
      const logsRes = await axios.get(`${API_BASE}/logs.php`, {
        headers: { "Content-Type": "application/json" },
      });
      const allLogs = Array.isArray(logsRes.data)
        ? logsRes.data
        : logsRes.data?.logs || [];
      setLogs(allLogs);

      // جلب بيانات الجهاز نفسه
      const deviceRes = await axios.get(
        `${API_BASE}/${deviceType}s/${deviceId}`
      );
      const device = deviceRes.data;
      setDeviceData(device);

      // فلترة الـ logs حسب القسم الحالي + آخر 50
      const filtered = filterLogsBySection(allLogs, device, sectionName);
      setFilteredLogs(filtered);
    } catch (err) {
      setError(`Failed to load logs or device data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (log) => {
    const logId = extractLogId(log);
    if (!logId) return alert("Cannot delete: No valid ID found for this log");
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      setDeletingId(logId);
      await axios.delete(`${API_BASE}/logs/${logId}`);
      setLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      setFilteredLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
    } catch {
      setLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      setFilteredLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      alert("Log deleted locally (check API)");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllLogs = async () => {
    if (!filteredLogs.length) return alert("No logs to delete");
    if (
      !confirm(
        `Are you sure you want to delete all ${filteredLogs.length} logs?`
      )
    )
      return;

    const validLogs = filteredLogs.filter((log) => extractLogId(log));
    const logIds = validLogs.map((log) => extractLogId(log));

    try {
      setClearingAll(true);
      await axios.delete(`${API_BASE}/logs`, { data: { ids: logIds } });
      setLogs((prev) =>
        prev.filter((log) => !logIds.includes(extractLogId(log)))
      );
      setFilteredLogs([]);
      alert(`Deleted ${logIds.length} logs`);
    } catch {
      setLogs((prev) =>
        prev.filter((log) => !logIds.includes(extractLogId(log)))
      );
      setFilteredLogs([]);
      alert("All logs cleared locally");
    } finally {
      setClearingAll(false);
    }
  };

  if (loading)
    return (
      <p className="text-center py-10">
        Loading logs for {deviceType} {deviceId}...
      </p>
    );

  if (error)
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchLogsAndDevice}
          className="bg-main-color text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-main-color">
          {deviceType === "robot" ? "Robot" : "Trolley"} Logs - Section "
          {sectionName}"
        </h2>
        {filteredLogs.length > 0 && (
          <button
            onClick={handleClearAllLogs}
            disabled={clearingAll}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {clearingAll ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Clear All ({filteredLogs.length})
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Total Logs: {filteredLogs.length}
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.map((log, index) => {
          const logId = extractLogId(log);
          const hasValidId = !!logId;
          return (
            <div
              key={logId || index}
              className={`border rounded-lg p-3 flex justify-between items-start gap-3 group transition-colors ${
                hasValidId
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-yellow-50 hover:bg-yellow-100"
              }`}
            >
              <div className="flex-1">
                <div className="text-sm text-gray-700">{log.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {log.date} {log.time}
                </div>
                {!hasValidId && (
                  <div className="text-xs text-red-500 mt-1">
                    ⚠️ Cannot delete individually (no ID)
                  </div>
                )}
              </div>
              {hasValidId && (
                <button
                  onClick={() => handleDeleteLog(log)}
                  disabled={deletingId === logId}
                  className="p-2 text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                  title="Delete this log"
                >
                  {deletingId === logId ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredLogs.length === 0 && logs.length > 0 && (
        <div className="text-center py-4 text-orange-500">
          <p>No logs found for section "{sectionName}"</p>
          <p className="text-sm">Total logs available: {logs.length}</p>
        </div>
      )}

      {filteredLogs.length === 0 && logs.length === 0 && (
        <div className="text-center py-4 text-gray-500">No logs available</div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={fetchLogsAndDevice}
          className="bg-main-color text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Logs
        </button>
        {filteredLogs.length > 0 && (
          <span className="text-sm text-gray-500">
            {filteredLogs.length} log(s) found
          </span>
        )}
      </div>
    </div>
  );
}
