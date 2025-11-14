import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader, Bell } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationsDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/notifications.php`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load notifications: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRobotFromNotification = async (note) => {
    try {
      if (!note.projectId || !note.topic_main) return null;

      const res = await axios.get(`${API_BASE}/robots.php`);
      const robots = Array.isArray(res.data) ? res.data : [];

      const matched = robots.find(
        (r) =>
          r.projectId == note.projectId &&
          r.Sections &&
          Object.values(r.Sections).some(
            (sec) => sec.Topic_main === note.topic_main
          )
      );

      return matched || null;
    } catch (err) {
      return null;
    }
  };

  const handleClickNotification = async (note) => {
    let robotId = note.RobotId;
    let sectionName = note.SectionName;

    if (!robotId) {
      const robot = await getRobotFromNotification(note);
      if (robot) {
        robotId = robot.RobotID;

        const sec = Object.keys(robot.Sections).find(
          (k) => robot.Sections[k].Topic_main === note.topic_main
        );
        sectionName = sec;
      }
    }

    if (!robotId) {
      alert("Cannot open this robot. Missing RobotId.");
      return;
    }

    navigate(`/robots/${robotId}`, {
      state: { section: sectionName || null },
    });

    if (onClose) onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 w-96 max-h-[500px] bg-white shadow-lg rounded-lg border border-gray-200 overflow-y-auto z-50 p-2"
    >
      <h3 className="text-lg font-semibold text-main-color mb-2 flex items-center gap-2">
        <Bell className="w-5 h-5" /> Notifications
      </h3>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader className="w-6 h-6 animate-spin text-main-color" />
        </div>
      )}

      {error && <p className="text-red-500 px-2">{error}</p>}

      {!loading && notifications.length === 0 && (
        <p className="text-gray-500 px-2 py-4 text-center">No notifications found</p>
      )}

      {!loading &&
        notifications.map((note, i) => (
          <Card
            key={note.notificationId || i}
            className="mb-2 p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleClickNotification(note)}
          >
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-semibold text-main-color">
                {note.message}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-1">
              <p className="text-xs text-gray-500">
                Date: {note.date} | Time: {note.time}
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
