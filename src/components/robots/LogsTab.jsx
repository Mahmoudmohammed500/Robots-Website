import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { Trash2, X, Loader, Download } from "lucide-react";

export default function LogsTabView({ sectionName }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  // NEW: POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    type: null,
    data: null,
  });

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

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const extractLogId = (log) => {
    const fields = ["id", "log_id", "logId", "ID", "Id"];
    for (const f of fields) {
      if (log[f] !== undefined && log[f] !== null && log[f] !== "") {
        return log[f];
      }
    }
    return null;
  };

  const filterLogsBySection = (logsData, device, sectionName) => {
    if (!device?.Sections?.[sectionName] || !Array.isArray(logsData)) return [];
    const topic = device.Sections[sectionName].Topic_main;

    const filtered = logsData.filter((log) => log.topic_main === topic);

    const sorted = filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

    const lastFifty = sorted.slice(-50);
    return lastFifty.reverse();
  };

  const fetchLogsAndDevice = async () => {
    try {
      setLoading(true);
      setError(null);

      const logsRes = await axios.get(`${API_BASE}/logs.php`, {
        headers: { "Content-Type": "application/json" },
      });
      const allLogs = Array.isArray(logsRes.data)
        ? logsRes.data
        : logsRes.data?.logs || [];
      setLogs(allLogs);

      const deviceRes = await axios.get(`${API_BASE}/${deviceType}s/${deviceId}`);
      const device = deviceRes.data;
      setDeviceData(device);

      const filtered = filterLogsBySection(allLogs, device, sectionName);
      setFilteredLogs(filtered);
    } catch (err) {
      setError(`Failed to load logs or device data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // DELETE LOG WITH POPUP — NO alert / confirm
  // ----------------------------------------

  const handleDeleteLog = (log) => {
    const logId = extractLogId(log);
    if (!logId) {
      setPopup({
        show: true,
        type: "error",
        data: "Cannot delete: No valid ID found for this log",
      });
      return;
    }

    setPopup({
      show: true,
      type: "deleteOne",
      data: log,
    });
  };

  const confirmDeleteLog = async () => {
    const log = popup.data;
    const logId = extractLogId(log);

    try {
      setDeletingId(logId);
      await axios.delete(`${API_BASE}/logs/${encodeURIComponent(logId)}`);

      setLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      setFilteredLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
    } catch (err) {
      setLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      setFilteredLogs((prev) => prev.filter((l) => extractLogId(l) !== logId));
      setPopup({
        show: true,
        type: "error",
        data: "Log deleted locally. API error occurred.",
      });
    } finally {
      setDeletingId(null);
      setPopup({ show: false, type: null, data: null });
    }
  };

  // ----------------------------------------
  // CLEAR ALL LOGS WITH POPUP
  // ----------------------------------------

  const handleClearAllLogs = () => {
    if (!filteredLogs.length) {
      setPopup({
        show: true,
        type: "error",
        data: "No logs to delete",
      });
      return;
    }

    setPopup({
      show: true,
      type: "deleteAll",
      data: filteredLogs,
    });
  };

  const confirmClearAll = async () => {
    const logIds = filteredLogs
      .map((log) => extractLogId(log))
      .filter(Boolean);

    try {
      setClearingAll(true);
      await axios.delete(`${API_BASE}/logs`, { data: { ids: logIds } });
      setLogs((prev) => prev.filter((log) => !logIds.includes(extractLogId(log))));
      setFilteredLogs([]);
    } catch (err) {
      setLogs((prev) => prev.filter((log) => !logIds.includes(extractLogId(log))));
      setFilteredLogs([]);
      setPopup({
        show: true,
        type: "error",
        data: "All logs cleared locally. API error occurred.",
      });
    } finally {
      setClearingAll(false);
      setPopup({ show: false, type: null, data: null });
    }
  };

  // ----------------------------------------
  // DOWNLOAD EXCEL — unchanged
  // ----------------------------------------

  const handleDownloadExcel = () => {
    if (filteredLogs.length === 0) {
      setToast({ show: true, message: "No logs available to download" });
      return;
    }

    const headers = ["Date", "Time", "Message", "Topic"];

    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          `"'${log.date || ""}'"`,
          `"'${log.time || ""}'"`,
          `"${(log.message || "").replace(/"/g, '""')}"`,
          `"${log.topic_main || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `logs_${Date.now()}.csv`;
    link.click();
  };

  // ----------------------------------------
  // POPUP UI
  // ----------------------------------------

  const Popup = () =>
    popup.show ? (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
          {popup.type === "error" && (
            <>
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Warning
              </h3>
              <p className="mb-4">{popup.data}</p>
              <button
                onClick={() => setPopup({ show: false, type: null, data: null })}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                OK
              </button>
            </>
          )}

          {popup.type === "deleteOne" && (
            <>
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Delete Log?
              </h3>
              <p className="mb-4">Are you sure you want to delete this log?</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={confirmDeleteLog}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setPopup({ show: false, type: null, data: null })}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {popup.type === "deleteAll" && (
            <>
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Clear All Logs?
              </h3>
              <p className="mb-4">
                This will delete{" "}
                <strong>{filteredLogs.length}</strong> logs permanently.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={confirmClearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setPopup({ show: false, type: null, data: null })}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    ) : null;

  // ----------------------------------------

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
    <>
      <Popup />

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        {toast.show && (
          <div className="fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {toast.message}
          </div>
        )}

        <div className="flex max-md:flex-wrap max-md:gap-2 justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-main-color">
            {deviceType === "robot" ? "Robot" : "Trolley"} Logs - Section "{sectionName}"
          </h2>
          <div className="flex gap-2">
            {filteredLogs.length > 0 && (
              <>
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-1 bg-green-500 text-white px-2 md:px-3 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>

                <button
                  onClick={handleClearAllLogs}
                  disabled={clearingAll}
                  className="flex items-center gap-2 bg-red-500 text-white px-2 md:px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300 transition-colors"
                >
                  {clearingAll ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Clear All ({filteredLogs.length})
                </button>
              </>
            )}
          </div>
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
    </>
  );
}
