import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
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

export default function NotificationsTab({ projectId, robotId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    id: null,
    message: "",
    date: "",
    time: "",
  });

  const API_BASE = "http://localhost/robotsback/api/";

  useEffect(() => {
    if (!projectId || !robotId) return;
    fetchNotes();
  }, [projectId, robotId]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/notifications?projectId=${projectId}&robotId=${robotId}`
      );
      console.log("Notes:", res.data);
      setNotes(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentNote.message || !currentNote.date || !currentNote.time) {
      alert("Please fill all fields");
      return;
    }

    const data = {
      message: currentNote.message,
      date: currentNote.date,
      time: currentNote.time,
      projectId,
      robotId,
    };

    try {
      if (editMode) {
        await axios.put(`${API_BASE}/notifications/${currentNote.id}`, data);
      } else {
        await axios.post(`${API_BASE}/notifications`, data);
      }
      fetchNotes();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save notification");
    }
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      await axios.delete(`${API_BASE}/notifications/${id}`);
      fetchNotes();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const resetForm = () => {
    setCurrentNote({ id: null, message: "", date: "", time: "" });
    setEditMode(false);
  };

  return (
    <div className="relative p-4">
      {/* ====== Header ====== */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-main-color">
          Notifications
        </h2>
      </div>

      {/* ====== Notifications List ====== */}
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
              <CardHeader>
                <CardTitle className="text-lg text-main-color">
                  {note.message}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Date: {note.date} | Time: {note.time}
                </p>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(note)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ====== Floating Add Button (Always Visible) ====== */}
      <Button
        className="fixed bottom-6 right-6 bg-main-color text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform z-50"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        <PlusCircle className="w-6 h-6" />
      </Button>

      {/* ====== Add/Edit Modal ====== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Notification" : "Add Notification"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <Label>Message</Label>
              <Input
                value={currentNote.message}
                onChange={(e) =>
                  setCurrentNote({ ...currentNote, message: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={currentNote.date}
                onChange={(e) =>
                  setCurrentNote({ ...currentNote, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={currentNote.time}
                onChange={(e) =>
                  setCurrentNote({ ...currentNote, time: e.target.value })
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
