// src/components/robots/LogsTab.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LogsTab({ projectId, robotId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLog, setCurrentLog] = useState({
    id: null,
    message: "",
    date: "",
    time: "",
  });

  const API_BASE = "http://localhost/robotsback/api/robots.php"; 

  useEffect(() => {
    if (!projectId || !robotId) return;
    fetchLogs();
  }, [projectId, robotId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/logs?projectId=${projectId}&robotId=${robotId}`
      );
      setLogs(res.data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentLog.message || !currentLog.date || !currentLog.time) {
      alert("Please fill all fields");
      return;
    }

    const data = {
      message: currentLog.message,
      type: "info",
      date: currentLog.date,
      time: currentLog.time,
      projectId,
      robotId,
    };

    try {
      if (editMode) {
        await axios.put(`${API_BASE}/logs/${currentLog.id}`, data);
      } else {
        await axios.post(`${API_BASE}/logs`, data);
      }
      fetchLogs();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save log");
    }
  };

  const handleEdit = (log) => {
    setCurrentLog(log);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await axios.delete(`${API_BASE}/logs/${id}`);
      fetchLogs();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const resetForm = () => {
    setCurrentLog({ id: null, message: "", date: "", time: "" });
    setEditMode(false);
  };

  return (
    <div className="relative bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-main-color">Logs</h2>
        <Button
          className="bg-second-color text-white flex items-center gap-1"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Log
        </Button>
      </div>

      {/* Logs list */}
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs found.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-50 border rounded-lg p-3 flex justify-between items-start"
            >
              <div className="text-sm text-gray-700">
                {log.message}
                <div className="text-xs text-gray-400 mt-1">
                  {log.date} {log.time}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(log)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(log.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-6 right-6 bg-main-color text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform z-50"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        Add
      </Button>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Log" : "Add Log"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <Label>Message</Label>
              <Input
                value={currentLog.message}
                onChange={(e) =>
                  setCurrentLog({ ...currentLog, message: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={currentLog.date}
                onChange={(e) =>
                  setCurrentLog({ ...currentLog, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={currentLog.time}
                onChange={(e) =>
                  setCurrentLog({ ...currentLog, time: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-main-color text-white" onClick={handleSave}>
              {editMode ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
