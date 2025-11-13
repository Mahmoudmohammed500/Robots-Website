import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Play, Square, XCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { getData, postData } from "@/services/getServices";
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

  const isNewButton = buttonId === "new";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  console.log("ButtonSetting - ID:", id, "ButtonID:", buttonId, "isNew:", isNewButton);

  // Determine section based on the current path
  const getSectionFromPath = () => {
    if (location.pathname.includes('trolleySettings')) {
      return 'car';
    }
    return 'main';
  };

  const section = getSectionFromPath();
  const isTrolley = section === 'car';

  console.log("Section detected:", section, "isTrolley:", isTrolley);

  // Fetch robot and button data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch robot data first
        console.log("Fetching robot data for ID:", id);
        const robot = await getData(`${BASE_URL}/robots/${id}`);
        console.log("Robot data received:", robot);
        setRobotData(robot);

        if (!isNewButton) {
          // Fetch button data if editing, not creating
          console.log("Fetching button data for ID:", buttonId);
          const btn = await getData(`${BASE_URL}/buttons/${buttonId}`);
          console.log("Button data received:", btn);
          
          if (btn) {
            setButtonData(btn);
            setName(btn.BtnName || "");
            setColor(btn.Color || "#4CAF50");
            setOperation(btn.Operation || "/start");
            setProjectId(btn.projectId || 10);
          } else {
            setError("Button not found");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, buttonId, isNewButton]);

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Quick select start or stop operation
  const useOperation = (op) => {
    setOperation(op);
  };

  // Update robot button data
  const updateRobotButtons = async (newButtonId, action = 'add') => {
    try {
      if (!robotData) return;

      const updatedRobot = { ...robotData };
      
      // Ensure Sections structure exists
      if (!updatedRobot.Sections) {
        updatedRobot.Sections = {};
      }
      if (!updatedRobot.Sections[section]) {
        updatedRobot.Sections[section] = { ActiveBtns: [] };
      }
      if (!Array.isArray(updatedRobot.Sections[section].ActiveBtns)) {
        updatedRobot.Sections[section].ActiveBtns = [];
      }

      if (action === 'add') {
        // Add new button to ActiveBtns
        const newButtonRef = {
          id: newButtonId,
          Name: name,
          Color: color,
          Operation: operation
        };
        
        // Avoid duplicates
        const existingIndex = updatedRobot.Sections[section].ActiveBtns.findIndex(
          btn => btn.id === newButtonId
        );
        
        if (existingIndex === -1) {
          updatedRobot.Sections[section].ActiveBtns.push(newButtonRef);
        } else {
          updatedRobot.Sections[section].ActiveBtns[existingIndex] = newButtonRef;
        }
      } else if (action === 'delete') {
        // Remove button from ActiveBtns
        updatedRobot.Sections[section].ActiveBtns = updatedRobot.Sections[section].ActiveBtns.filter(
          btn => btn.id !== buttonId
        );
      } else if (action === 'update') {
        // Update button data in ActiveBtns
        const buttonIndex = updatedRobot.Sections[section].ActiveBtns.findIndex(
          btn => btn.id === buttonId
        );
        
        if (buttonIndex !== -1) {
          updatedRobot.Sections[section].ActiveBtns[buttonIndex] = {
            ...updatedRobot.Sections[section].ActiveBtns[buttonIndex],
            Name: name,
            Color: color,
            Operation: operation
          };
        }
      }

      console.log("Updating robot with new buttons:", updatedRobot);
      await putData(`${BASE_URL}/robots/${id}`, updatedRobot);
      console.log("Robot updated successfully");

    } catch (error) {
      console.error("Error updating robot buttons:", error);
      throw new Error(`Failed to update robot: ${error.message}`);
    }
  };

  // Save button (create or update)
  const handleSaveButton = async () => {
    if (!name.trim()) {
      alert("Please enter a button name");
      return;
    }

    if (!operation.trim()) {
      alert("Please enter an operation");
      return;
    }

    // Ensure operation starts with /
    let finalOperation = operation.trim();
    if (!finalOperation.startsWith('/')) {
      finalOperation = '/' + finalOperation;
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

      console.log("Saving button with payload:", buttonPayload);

      let savedButtonId;

      if (isNewButton) {
        // Create new button - POST to /buttons with section parameter
        console.log("Creating new button for section:", section);
        const result = await postData(`${BASE_URL}/buttons?section=${section}`, buttonPayload);
        console.log("Create button result:", result);
        savedButtonId = result.id || result.BtnID;
        
        // Update robot with new button added
        await updateRobotButtons(savedButtonId, 'add');
      } else {
        // Update existing button - PUT to /buttons/{id}
        const btnId = buttonData?.BtnID ?? buttonData?.id ?? buttonId;
        console.log("Updating button with ID:", btnId);
        const result = await putData(`${BASE_URL}/buttons/${btnId}`, buttonPayload);
        console.log("Update button result:", result);
        savedButtonId = btnId;
        
        // Update robot with updated button data
        await updateRobotButtons(savedButtonId, 'update');
      }

      setSubmitting(false);
      
      // Navigate back to the correct settings page
      const settingsPath = isTrolley 
        ? `/homeDashboard/trolleySettings/${id}`
        : `/homeDashboard/robotSettings/${id}`;
      
      console.log("Navigating back to:", settingsPath);
      navigate(settingsPath, { state: { refresh: true } });
      
    } catch (error) {
      console.error("Save error:", error);
      setError(`Failed to save button: ${error.message}`);
      setSubmitting(false);
    }
  };

  // Delete button
  const handleDeleteButton = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const btnId = buttonData?.BtnID ?? buttonData?.id ?? buttonId;
      console.log("Deleting button with ID:", btnId);
      
      // Delete button from database
      await deleteData(`${BASE_URL}/buttons/${btnId}`);
      
      // Update robot to remove deleted button
      await updateRobotButtons(btnId, 'delete');
      
      setShowDeleteModal(false);
      setSubmitting(false);
      
      // Navigate back to settings page
      const settingsPath = isTrolley 
        ? `/homeDashboard/trolleySettings/${id}`
        : `/homeDashboard/robotSettings/${id}`;
      
      console.log("Navigating back after delete:", settingsPath);
      navigate(settingsPath, { replace: true, state: { refresh: true } });
      
    } catch (error) {
      console.error("Delete error:", error);
      setError(`Failed to delete button: ${error.message}`);
      setSubmitting(false);
    }
  };

  // Go back to previous page
const handleBack = () => {
  console.log("Navigating back to previous page");
  navigate(-1);
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
        <Button 
          onClick={handleBack} 
          className="mb-6 flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color transition-all duration-200"
        >
          <ArrowLeft size={18} /> Back to {isTrolley ? 'Trolley' : 'Robot'} Settings
        </Button>

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
              {isTrolley ? 'Trolley Section' : 'Main Robot Section'} | Robot ID: {id}
              {robotData?.RobotName && ` | Robot: ${robotData.RobotName}`}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Button 
              onClick={handleSaveButton} 
              disabled={submitting} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <Save size={18} /> 
              {submitting ? "Saving..." : (isNewButton ? "Create Button" : "Update Button")}
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

          {/* Edit Name */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-3 text-gray-700">Button Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter button name"
              className="text-center bg-gray-50 border-gray-200 rounded-xl py-3 text-lg"
            />
          </div>

          {/* Edit Color */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Button Color</h2>
            <div className="flex flex-col items-center gap-4">
              <HexColorPicker color={color} onChange={setColor} className="mb-4" />
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-gray-300 shadow-md" 
                  style={{ backgroundColor: color }} 
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">Selected Color:</p>
                  <p className="text-sm text-gray-600 font-mono">{color}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Operation */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Button Operation</h2>
            
            {/* Main input field */}
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

            {/* Quick select Start and Stop */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Quick select:</p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => useOperation('/start')}
                  variant={operation === '/start' ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === '/start' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Play size={16} /> Start
                </Button>
                <Button
                  onClick={() => useOperation('/stop')}
                  variant={operation === '/stop' ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    operation === '/stop' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Square size={16} /> Stop
                </Button>
              </div>
            </div>
          </div>

          {/* Project ID (edit only) */}
          {!isNewButton && (
            <div className="mb-8">
            </div>
          )}

          {/* API Endpoint Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">API Endpoint Preview</h2>
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
