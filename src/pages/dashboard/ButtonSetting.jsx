import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Play, Square, XCircle, Copy, Eye, AlertCircle, RotateCcw, FastForward, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { getData, postData } from "@/services/getServices";
import { putData } from "@/services/putServices";
import { deleteData } from "@/services/deleteServices";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Confirm Delete Modal Component
function ConfirmDeleteModal({ buttonName, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
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
            <Button 
              onClick={onCancel} 
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all cursor-pointer"
            >
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
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [buttonData, setButtonData] = useState(null);
  const [robotData, setRobotData] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4CAF50");
  const [operation, setOperation] = useState("/start");
  const [projectId, setProjectId] = useState(10);
  const [duplicateError, setDuplicateError] = useState("");
  const [hexInput, setHexInput] = useState("#4CAF50");

  const isNewButton = buttonId === "new";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Determine section from URL
  const getSectionFromPath = () => {
    if (location.pathname.includes("trolleySettings")) return "car";
    return "main";
  };

  const section = getSectionFromPath();
  const isTrolley = section === "car";

  // Check for duplicate buttons in the same section
  const checkForDuplicates = () => {
    if (!robotData || !robotData.Sections || !robotData.Sections[section]) {
      return false;
    }

    const sectionButtons = robotData.Sections[section].ActiveBtns || [];
    
    // Check for duplicate name in the same section
    const duplicateName = sectionButtons.some(btn => 
      btn.Name?.toLowerCase() === name.toLowerCase() && 
      btn.id !== buttonId
    );

    // Check for duplicate color in the same section
    const duplicateColor = sectionButtons.some(btn => 
      btn.Color === color && 
      btn.id !== buttonId
    );

    if (duplicateName) {
      setDuplicateError(`A button with the name "${name}" already exists in this ${isTrolley ? "trolley" : "robot"} section.`);
      return true;
    }

    if (duplicateColor) {
      setDuplicateError(`A button with the color ${color} already exists in this ${isTrolley ? "trolley" : "robot"} section.`);
      return true;
    }

    setDuplicateError("");
    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const robot = await getData(`${BASE_URL}/robots/${id}`);
        setRobotData(robot);

        if (!isNewButton) {
          const btn = await getData(`${BASE_URL}/buttons/${buttonId}`);
          if (btn) {
            setButtonData(btn);
            setName(btn.BtnName || "");
            setColor(btn.Color || "#4CAF50");
            setHexInput(btn.Color || "#4CAF50");
            setOperation(btn.Operation || "/start");
            setProjectId(btn.projectId || 10);
          } else {
            setError("Button not found");
          }
        }
      } catch (error) {
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, buttonId, isNewButton, BASE_URL]);

  // Check for duplicates when name or color changes
  useEffect(() => {
    if (name.trim() && color) {
      checkForDuplicates();
    } else {
      setDuplicateError("");
    }
  }, [name, color]);

  // Update hex input when color changes from picker
  useEffect(() => {
    setHexInput(color);
  }, [color]);

  // Handle hex color input
  const handleHexInputChange = (value) => {
    setHexInput(value);
    
    // Validate and update color if it's a valid hex color
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.test(value)) {
      setColor(value);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const useOperation = (op) => {
    setOperation(op);
  };

  // Update robot ActiveBtns
  const updateRobotButtons = async (newButtonId, action = "add") => {
    try {
      if (!robotData) return;

      const updatedRobot = { ...robotData };

      if (!updatedRobot.Sections) updatedRobot.Sections = {};
      if (!updatedRobot.Sections[section])
        updatedRobot.Sections[section] = { ActiveBtns: [] };
      if (!Array.isArray(updatedRobot.Sections[section].ActiveBtns))
        updatedRobot.Sections[section].ActiveBtns = [];

      if (action === "add") {
        const newButtonRef = {
          id: newButtonId,
          Name: name,
          Color: color,
          Operation: operation,
        };

        const existingIndex = updatedRobot.Sections[section].ActiveBtns.findIndex(
          (btn) => btn.id === newButtonId
        );

        if (existingIndex === -1) {
          updatedRobot.Sections[section].ActiveBtns.push(newButtonRef);
        } else {
          updatedRobot.Sections[section].ActiveBtns[existingIndex] = newButtonRef;
        }
      } else if (action === "delete") {
        updatedRobot.Sections[section].ActiveBtns =
          updatedRobot.Sections[section].ActiveBtns.filter(
            (btn) => btn.id !== buttonId
          );
      } else if (action === "update") {
        const buttonIndex = updatedRobot.Sections[section].ActiveBtns.findIndex(
          (btn) => btn.id === buttonId
        );

        if (buttonIndex !== -1) {
          updatedRobot.Sections[section].ActiveBtns[buttonIndex] = {
            ...updatedRobot.Sections[section].ActiveBtns[buttonIndex],
            Name: name,
            Color: color,
            Operation: operation,
          };
        }
      }

      await putData(`${BASE_URL}/robots/${id}`, updatedRobot);
    } catch (error) {
      throw new Error(`Failed to update robot: ${error.message}`);
    }
  };

  // SAVE BUTTON
  const handleSaveButton = async () => {
    if (!name.trim()) {
      toast.error("Please enter a button name");
      return;
    }

    if (!color || color.trim() === "") {
      toast.error("Please choose a color for the button");
      return;
    }

    if (!operation.trim()) {
      toast.error("Please enter an operation");
      return;
    }

    // Check for duplicates before saving
    if (checkForDuplicates()) {
      toast.error("Cannot save button due to duplicate name or color");
      return;
    }

    let finalOperation = operation.trim();
    if (!finalOperation.startsWith("/")) {
      finalOperation = "/" + finalOperation;
      setOperation(finalOperation);
    }

    try {
      setSubmitting(true);
      setError(null);

      const buttonPayload = {
        BtnName: name.trim(),
        RobotId: parseInt(id),
        Color: color,
        Operation: finalOperation,
        projectId: projectId,
      };

      let savedButtonId;

      if (isNewButton) {
        const result = await postData(
          `${BASE_URL}/buttons?section=${section}`,
          buttonPayload
        );
        savedButtonId = result.id || result.BtnID;
        await updateRobotButtons(savedButtonId, "add");
      } else {
        const btnId = buttonData?.BtnID ?? buttonData?.id ?? buttonId;
        const result = await putData(`${BASE_URL}/buttons/${btnId}`, buttonPayload);
        savedButtonId = btnId;
        await updateRobotButtons(savedButtonId, "update");
      }

      setSubmitting(false);

      navigate(`/homeDashboard/robotDetails/${id}`, {
        state: { refresh: true },
      });
    } catch (error) {
      setError(`Failed to save button: ${error.message}`);
      setSubmitting(false);
    }
  };

  const handleDeleteButton = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const btnId = buttonData?.BtnID ?? buttonData?.id ?? buttonId;

      await deleteData(`${BASE_URL}/buttons/${btnId}`);
      await updateRobotButtons(btnId, "delete");

      setShowDeleteModal(false);
      setSubmitting(false);

      navigate(`/homeDashboard/robotDetails/${id}`, {
        replace: true,
        state: { refresh: true },
      });
    } catch (error) {
      setError(`Failed to delete button: ${error.message}`);
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewRobot = () => {
    navigate(`/homeDashboard/robotDetails/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto mb-4"></div>
          Loading button data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleBack}
            className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color transition-all duration-200 flex-1"
          >
            <ArrowLeft size={18} /> Back to {isTrolley ? "Trolley" : "Robot"} Settings
          </Button>
          
          <Button
            onClick={handleViewRobot}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-white hover:text-blue-600 border border-blue-600 transition-all duration-200 flex-1"
          >
            <Eye size={18} /> View Robot
          </Button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {isNewButton ? "Add New Button" : `Edit ${name} Button`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isTrolley ? "Trolley Section" : "Main Robot Section"} | Robot ID: {id}
              {robotData?.RobotName && ` | Robot: ${robotData.RobotName}`}
            </p>
          </div>

          {/* Duplicate Error Message */}
          {duplicateError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-center flex items-center justify-center gap-2"
            >
              <AlertCircle size={20} />
              {duplicateError}
            </motion.div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={handleSaveButton}
              disabled={submitting || duplicateError}
              className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all ${
                (submitting || duplicateError) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} />
              {submitting ? "Saving..." : isNewButton ? "Create Button" : "Update Button"}
            </Button>
            {!isNewButton && (
              <Button
                onClick={() => setShowDeleteModal(true)}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                <Trash2 size={18} /> Delete Button
              </Button>
            )}
          </div>

          {/* Button Name */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Button Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter button name"
              className="text-center bg-gray-50 border-gray-200 rounded-xl py-3 text-lg"
            />
          </div>

          {/* Button Color */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Button Color</h2>
            <div className="flex flex-col items-center gap-4">
              <HexColorPicker color={color} onChange={setColor} className="mb-4" />
              
              {/* Hex Color Input */}
              <div className="flex items-center gap-4 w-full max-w-xs">
                <div
                  className="w-16 h-16 rounded-full border-2 border-gray-300 shadow-md flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Hex Color Code:
                  </label>
                  <Input
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="#4CAF50"
                    className="text-center font-mono bg-gray-50 border-gray-200 rounded-xl py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-left">
                    Enter a valid hex color code (e.g., #FF5733)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operation */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Button Operation</h2>

            <div className="max-w-md mx-auto mb-4">
              <div className="relative">
                <Input
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  placeholder="Type operation like /start, /stop, etc."
                  className="text-center bg-gray-50 border-gray-200 rounded-xl py-3 text-lg font-mono pr-12"
                />
                <Button
                  onClick={() => copyToClipboard(operation)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
                  variant="ghost"
                  size="sm"
                >
                  <Copy size={16} />
                </Button>
              </div>
              {copied && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-600 text-sm text-center mt-2"
                >
                  Copied to clipboard!
                </motion.p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Quick select:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
                <Button
                  onClick={() => useOperation("/start")}
                  variant={operation === "/start" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === "/start"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Play size={16} /> Start
                </Button>
                <Button
                  onClick={() => useOperation("/stop")}
                  variant={operation === "/stop" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === "/stop"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Square size={16} /> Stop
                </Button>
                <Button
                  onClick={() => useOperation("/status")}
                  variant={operation === "/status" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === "/status"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <RotateCcw size={16} /> Status
                </Button>
                <Button
                  onClick={() => useOperation("/forward")}
                  variant={operation === "/forward" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === "/forward"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FastForward size={16} /> Forward
                </Button>
                <Button
                  onClick={() => useOperation("/backward")}
                  variant={operation === "/backward" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === "/backward"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Rewind size={16} /> Backward
                </Button>
              </div>
            </div>
          </div>

          {/* Selected Endpoint */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">
                API Endpoint Preview
              </h2>
              <Button
                onClick={() => copyToClipboard(`/buttons${operation}`)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Copy size={14} />
                Copy
              </Button>
            </div>
            <Input
              value={`https/buttons/${operation}`}
              readOnly
              className="text-center bg-white border-gray-300 rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              This endpoint will be called when the button is pressed
            </p>
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