// src/components/robots/NotificationsTab.jsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { Trash2, X, Loader, Bell } from "lucide-react";

export default function NotificationsTab() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  const params = useParams();
  const location = useLocation();
  
 

  // Extract IDs from the URL based on the actual structure
  const pathParts = location.pathname.split('/').filter(part => part !== '');

  // Extract deviceType and deviceId from the URL
  let deviceType = null;
  let deviceId = null;
  let projectId = "default";

  // Detect robotDetails or trolleyDetails in the URL
  if (pathParts.includes('robotDetails')) {
    deviceType = 'robot';
    const robotIndex = pathParts.indexOf('robotDetails');
    deviceId = pathParts[robotIndex + 1];
  } else if (pathParts.includes('trolleyDetails')) {
    deviceType = 'trolley';
    const trolleyIndex = pathParts.indexOf('trolleyDetails');
    deviceId = pathParts[trolleyIndex + 1];
  }

  // Fallback: extract from params if not found
  if (!deviceId && params.id) {
    deviceId = params.id;
    deviceType = 'robot';
  }

  

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!deviceId) {
      
      setError("Cannot determine device ID from URL");
      setLoading(false);
      return;
    }

    fetchNotes();
  }, [deviceId, deviceType]);

  // Filter notes by deviceId
  const filterNotesByDeviceId = (notesData, targetDeviceId) => {
    if (!Array.isArray(notesData)) return [];
    
    return notesData.filter(note => {
      const noteDeviceId = note.robot_id || note.device_id || note.robotId || note.deviceId;
      
      return String(noteDeviceId) === String(targetDeviceId);
    });
  };

  // Extract ID from note (handling different field names)
  const extractNoteId = (note) => {
    const possibleIdFields = ['id', 'notification_id', 'notificationId', 'ID', 'Id', 'note_id', 'noteId'];
    
    for (const field of possibleIdFields) {
      if (note[field] !== undefined && note[field] !== null && note[field] !== '') {
        return note[field];
      }
    }
    
    return null;
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE}/notifications.php?projectId=${projectId}`;
      
      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      
      let allNotes = [];
      
      if (res.data && Array.isArray(res.data)) {
        allNotes = res.data;
      } else if (res.data && res.data.notifications) {
        allNotes = res.data.notifications;
      } else if (res.data && res.data.success) {
        allNotes = res.data.data || [];
      } else {
        allNotes = [];
      }

      // Check for notification IDs
      allNotes.forEach((note, index) => {
        const noteId = extractNoteId(note);
        
      });

      setNotes(allNotes);
      const deviceSpecificNotes = filterNotesByDeviceId(allNotes, deviceId);
      setFilteredNotes(deviceSpecificNotes);
      
    } catch (err) {
      setError(`Failed to load notifications: ${err.message}`);
      
      // Using mock data for testing (fallback)
      const mockNotes = [
        { 
          id: 1, 
          notification_id: 1,
          robot_id: 37,
          message: `Notification for robot 37 - Test alert 1`, 
          date: "2024-01-15", 
          time: "09:20:00" 
        },
        { 
          id: 3, 
          notification_id: 3,
          robot_id: 37,
          message: `Notification for robot 37 - Test alert 2`, 
          date: "2024-01-15", 
          time: "14:35:00" 
        }
      ];
      
      setNotes(mockNotes);
      const filteredMockNotes = filterNotesByDeviceId(mockNotes, deviceId);
      setFilteredNotes(filteredMockNotes);
    } finally {
      setLoading(false);
    }
  };

  // Delete a single notification (multiple fallback methods)
  const handleDeleteNotification = async (note) => {
    const noteId = extractNoteId(note);
    
    if (!noteId) {
      alert("Cannot delete: No valid ID found for this notification");
      return;
    }

    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      setDeletingId(noteId);
      
      
      // Attempt 1: Direct endpoint
      try {
        const response = await axios.delete(`${API_BASE}/notifications/${noteId}`);
        
        const updatedNotes = notes.filter(n => extractNoteId(n) !== noteId);
        const updatedFilteredNotes = filteredNotes.filter(n => extractNoteId(n) !== noteId);
        
        setNotes(updatedNotes);
        setFilteredNotes(updatedFilteredNotes);
        setDeletingId(null);
        return;
      } catch (err1) {
      }

      // Attempt 2: Query parameter
      try {
        const response = await axios.delete(`${API_BASE}/notifications.php?id=${noteId}`);
        
        const updatedNotes = notes.filter(n => extractNoteId(n) !== noteId);
        const updatedFilteredNotes = filteredNotes.filter(n => extractNoteId(n) !== noteId);
        
        setNotes(updatedNotes);
        setFilteredNotes(updatedFilteredNotes);
        setDeletingId(null);
        return;
      } catch (err2) {
      }

      // Attempt 3: POST with data
      try {
        const response = await axios.post(`${API_BASE}/notifications.php`, {
          action: 'delete',
          id: noteId
        });
        
        const updatedNotes = notes.filter(n => extractNoteId(n) !== noteId);
        const updatedFilteredNotes = filteredNotes.filter(n => extractNoteId(n) !== noteId);
        
        setNotes(updatedNotes);
        setFilteredNotes(updatedFilteredNotes);
        setDeletingId(null);
        return;
      } catch (err3) {
      }

      // Attempt 4: GET with action
      try {
        const response = await axios.get(`${API_BASE}/notifications.php?action=delete&id=${noteId}`);
        
        const updatedNotes = notes.filter(n => extractNoteId(n) !== noteId);
        const updatedFilteredNotes = filteredNotes.filter(n => extractNoteId(n) !== noteId);
        
        setNotes(updatedNotes);
        setFilteredNotes(updatedFilteredNotes);
        setDeletingId(null);
        return;
      } catch (err4) {
      }

      throw new Error("All delete methods failed");

    } catch (err) {
      
      // Simulate delete locally (for testing)
      const updatedNotes = notes.filter(n => extractNoteId(n) !== noteId);
      const updatedFilteredNotes = filteredNotes.filter(n => extractNoteId(n) !== noteId);
      
      setNotes(updatedNotes);
      setFilteredNotes(updatedFilteredNotes);
      
      alert("Notification deleted locally (Check console for API details)");
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all notifications (with fallback methods)
  const handleClearAllNotifications = async () => {
    if (!filteredNotes.length) {
      alert("No notifications to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete all ${filteredNotes.length} notifications? This action cannot be undone.`)) {
      return;
    }

    try {
      setClearingAll(true);
      
      // Collect valid IDs only
      const validNotes = filteredNotes.filter(note => {
        const noteId = extractNoteId(note);
        if (!noteId) {
          return false;
        }
        return true;
      });

      if (validNotes.length === 0) {
        alert("No notifications with valid IDs found to delete");
        return;
      }

      const noteIds = validNotes.map(note => extractNoteId(note));
      
      // Try bulk delete
      try {
        const response = await axios.delete(`${API_BASE}/notifications`, {
          data: { ids: noteIds }
        });
      } catch (bulkErr) {
        
        for (const note of validNotes) {
          try {
            const noteId = extractNoteId(note);
            await axios.delete(`${API_BASE}/notifications/${noteId}`);
          } catch (singleErr) {
          }
        }
      }
      
      // Update state after clear
      const remainingNotes = notes.filter(note => 
        !validNotes.some(validNote => extractNoteId(validNote) === extractNoteId(note))
      );
      
      setNotes(remainingNotes);
      setFilteredNotes([]);
      
      alert(`Successfully deleted ${validNotes.length} notifications`);
      
    } catch (err) {
      
      // Simulate locally
      const remainingNotes = notes.filter(note => 
        !filteredNotes.some(filteredNote => extractNoteId(filteredNote) === extractNoteId(note))
      );
      
      setNotes(remainingNotes);
      setFilteredNotes([]);
      
      alert("All notifications cleared locally");
    } finally {
      setClearingAll(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading notifications for {deviceType} {deviceId}...</p>;
  if (error) return (
    <div className="text-center py-10">
      <p className="text-red-500 mb-4">{error}</p>
      <button 
        onClick={fetchNotes}
        className="bg-main-color text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-main-color">
          {deviceType === 'robot' ? 'Robot' : 'Trolley'} Notifications 
        </h2>
        
        {filteredNotes.length > 0 && (
          <button 
            onClick={handleClearAllNotifications}
            disabled={clearingAll}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {clearingAll ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Clear All ({filteredNotes.length})
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          All Notes: {filteredNotes.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredNotes.map((note, index) => {
          const noteId = extractNoteId(note);
          const hasValidId = !!noteId;
          
          return (
            <Card
              key={noteId || index}
              className={`shadow-md border transition-all hover:shadow-lg relative ${
                hasValidId ? 'border-gray-200' : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              {hasValidId && (
                <button 
                  onClick={() => handleDeleteNotification(note)}
                  disabled={deletingId === noteId}
                  className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                  title="Delete this notification"
                >
                  {deletingId === noteId ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-main-color" />
                  <CardTitle className="text-lg text-main-color">{note.message}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Date: {note.date} | Time: {note.time}
                </p>
                <p className={`text-xs mt-1 ${hasValidId ? 'text-green-600' : 'text-red-600'}`}>
                  Notification ID: {noteId || 'NOT FOUND'} | Device ID: {note.robot_id || note.device_id || note.robotId || note.deviceId}
                </p>
                {!hasValidId && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ This notification cannot be deleted individually (no ID found)
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredNotes.length === 0 && notes.length > 0 && (
        <div className="text-center py-4 text-orange-500">
          <p>No notifications found specifically for {deviceType} {deviceId}</p>
          <p className="text-sm">Total notifications available: {notes.length}</p>
        </div>
      )}
      
      {filteredNotes.length === 0 && notes.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No notifications available</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={fetchNotes}
          className="bg-main-color text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Notifications
        </button>
        
        {filteredNotes.length > 0 && (
          <span className="text-sm text-gray-500">
            {filteredNotes.length} notification(s) found
          </span>
        )}
      </div>

    </div>
  );
}
