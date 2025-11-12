import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Play, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { getData } from "@/services/getServices";
import { putData } from "@/services/putServices";
import { deleteData } from "@/services/deleteServices";
import { Input } from "@/components/ui/input";

// Confirm Delete Modal Component
function ConfirmDeleteModal({ buttonName, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border border-gray-200"
        >
          <XCircle size={48} className="mx-auto text-red-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-main-color">{buttonName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 rounded-xl transition-all cursor-pointer">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all cursor-pointer">
              Confirm
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ButtonSetting() {
  const { id, buttonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [buttonData, setButtonData] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4CAF50");
  const [action, setAction] = useState("start");

  const isNewButton = buttonId === "new";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch single button details from API
  useEffect(() => {
    const fetchButton = async () => {
      if (isNewButton) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const btn = await getData(`${BASE_URL}/buttons/${buttonId}`);
        if (btn) {
          setButtonData(btn);
          setName(btn.BtnName || "");
          setColor(btn.Color || "#4CAF50");
          setAction((btn.Operation || "/start").replace("/", ""));
        }
      } catch (error) {
        console.error("Error fetching button:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchButton();
  }, [buttonId, isNewButton]);

  // Update Button
  const handleUpdateButton = async () => {
    if (!buttonData) return;
    try {
      setSubmitting(true);
      const btnId = buttonData.BtnID ?? buttonData.id ?? buttonId;
      await putData(`${BASE_URL}/buttons/${btnId}`, {
        BtnName: name,
        RobotId: parseInt(id),
        Color: color,
        Operation: `/${action}`,
      });
      setSubmitting(false);
      navigate(`/homeDashboard/robotSettings/${id}`, { state: { refresh: true } });
    } catch (error) {
      console.error("Update error:", error);
      setSubmitting(false);
    }
  };

  // Delete Button
  const handleDeleteButton = async () => {
    try {
      setSubmitting(true);
      const btnId = buttonData?.BtnID ?? buttonData?.id ?? buttonId;
      await deleteData(`${BASE_URL}/buttons/${btnId}`);
      setShowDeleteModal(false);
      setSubmitting(false);
      navigate(`/homeDashboard/robotSettings/${id}`, { replace: true, state: { refresh: true } });
    } catch (error) {
      console.error("Delete error:", error);
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isNewButton ? "New Button" : `${name} Settings`}
          </h1>

          <div className="flex justify-center gap-4 mb-8">
            <Button onClick={handleUpdateButton} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              <Save size={18} className="mr-2" /> {submitting ? "Saving..." : "Update Button"}
            </Button>
            {!isNewButton && (
              <Button onClick={() => setShowDeleteModal(true)} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
                <Trash2 size={18} className="mr-2" /> Delete Button
              </Button>
            )}
          </div>

          {/* Edit Name */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-2 text-center">Button Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter button name"
              className="text-center bg-gray-100"
            />
          </div>

          {/* Edit Color */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-center">Button Color</h2>
            <div className="flex flex-col items-center gap-4">
              <HexColorPicker color={color} onChange={setColor} />
              <div className="w-16 h-16 rounded-full border-2 border-gray-300" style={{ backgroundColor: color }} />
              <p className="text-sm text-gray-600">Selected: {color}</p>
            </div>
          </div>

          {/* Edit Action */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-center">Button Action</h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setAction("start")} variant={action === "start" ? "default" : "outline"} className="flex items-center gap-2">
                <Play size={16} /> Start
              </Button>
              <Button onClick={() => setAction("stop")} variant={action === "stop" ? "default" : "outline"} className="flex items-center gap-2">
                <Square size={16} /> Stop
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-center">API Endpoint</h2>
            <Input value={`/api/buttons/${action}`} readOnly className="text-center bg-gray-100" />
          </div>
        </motion.div>
      </div>

      {showDeleteModal && buttonData && (
        <ConfirmDeleteModal
          buttonName={buttonData.BtnName || name || "Button"}
          onConfirm={handleDeleteButton}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
