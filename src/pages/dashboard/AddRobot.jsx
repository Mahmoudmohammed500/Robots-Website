import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Save, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { postData } from "@/services/postServices";
import { putData } from "@/services/putServices";
import { getData } from "@/services/getServices";
import { postButtons } from "@/services/postButtons";

export default function RobotForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const currentPath = location.pathname;
  const isEditMode = currentPath.includes("/editRobot/");

  const projectId = isEditMode ? location.state?.projectId : id;
  const projectName = location.state?.projectName || "";

  const [formData, setFormData] = useState({
    RobotName: "",
    Voltage: "",
    Cycles: "",
    Status: "Stopped",
    Image: null,
    imagePreview: null,
    ActiveBtns: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRobot = async () => {
      if (isEditMode && id) {
        setLoading(true);
        try {
          const data = await getData(`/robots.php/${id}`);
          setFormData({
            RobotName: data.RobotName || "",
            Voltage: data.Voltage?.toString() || "",
            Cycles: data.Cycles?.toString() || "",
            Status: data.Status || "Stopped",
            Image: data.Image || null,
            imagePreview: data.Image
              ? `http://localhost/robots_web_apis/${data.Image}`
              : null,
            ActiveBtns: data.ActiveBtns || [],
          });
        } catch (error) {
          toast.error("Failed to load robot data.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRobot();
  }, [id, isEditMode]);

  const availableButtons = [
    { id: 1, name: "start" },
    { id: 2, name: "stop" },
    { id: 3, name: "forward" },
    { id: 4, name: "backward" },
    { id: 5, name: "scheduling" },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "Image" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        Image: file,
        imagePreview: previewUrl,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleButtonSelect = (btn) => {
    const isSelected = formData.ActiveBtns.find((b) => b.name === btn.name);
    const updatedBtns = isSelected
      ? formData.ActiveBtns.filter((b) => b.name !== btn.name)
      : [...formData.ActiveBtns, btn];
    setFormData({ ...formData, ActiveBtns: updatedBtns });
  };

  const getLatestRobotId = async () => {
    try {
      const robots = await getData("/robots.php");
      console.log(" Raw robots data:", robots);
      
      if (robots && Array.isArray(robots) && robots.length > 0) {
        const latestRobot = robots.reduce((prev, current) => {
          const prevId = prev.RobotID || prev.id || prev.robotId || prev.robotID || 0;
          const currentId = current.RobotID || current.id || current.robotId || current.robotID || 0;
          return (prevId > currentId) ? prev : current;
        });
        
        const latestId = latestRobot.RobotID || latestRobot.id || latestRobot.robotId || latestRobot.robotID;
        console.log(" Latest robot ID found:", latestId);
        return latestId;
      }
      console.log("No robots found in response");
      return null;
    } catch (error) {
      console.error(" Error fetching latest robot ID:", error);
      return null;
    }
  };

  const findRobotIdByName = async (robotName) => {
    try {
      const robots = await getData("/robots.php");
      if (robots && Array.isArray(robots)) {
        const robot = robots.find(r => 
          r.RobotName === robotName || 
          r.robotName === robotName ||
          r.name === robotName
        );
        return robot ? (robot.RobotID || robot.id || robot.robotId || robot.robotID) : null;
      }
      return null;
    } catch (error) {
      console.error("Error finding robot by name:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.RobotName || !formData.Voltage || !formData.Cycles) {
      toast.warning("Please fill all required fields!", {
        icon: <XCircle className="text-yellow-500" />,
      });
      setSubmitting(false);
      return;
    }

    if (!projectId) {
      toast.error("Project ID is missing. Please go back and try again.");
      setSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        projectId: parseInt(projectId),
        RobotName: formData.RobotName,
        Voltage: parseFloat(formData.Voltage),
        Cycles: parseInt(formData.Cycles),
        Status: formData.Status,
        ActiveBtns: formData.ActiveBtns,
      };

      if (formData.Image) {
        if (typeof formData.Image === "string") {
          dataToSend.Image = formData.Image;
        } else if (formData.Image instanceof File) {
          dataToSend.Image = `uploads/${formData.Image.name}`;
        }
      }

      console.log(" Sending robot data:", dataToSend);

      let response;
      let robotId;

      if (isEditMode) {
        response = await putData(`/robots.php/${id}`, dataToSend);
        robotId = id;
        console.log(" Edit mode - Robot ID:", robotId);
      } else {
        response = await postData("/robots.php", dataToSend);
        console.log(" Robot creation response:", response);

        robotId = response?.insertedId || response?.id || response?.RobotID || response?.robotId;
        
        if (!robotId) {
          console.log(" Trying alternative methods to get robot ID...");
          
          robotId = await findRobotIdByName(formData.RobotName);
          console.log(" Robot ID found by name:", robotId);
          
          if (!robotId) {
            robotId = await getLatestRobotId();
            console.log(" Latest robot ID:", robotId);
          }
          
          if (!robotId) {
            const url = response?.request?.responseURL || window.location.href;
            const match = url.match(/[?&]id=(\d+)/);
            if (match) {
              robotId = match[1];
              console.log(" Robot ID from URL:", robotId);
            }
          }
        }
      }

      console.log(" Final Robot ID:", robotId);

      if (!robotId) {
        console.error(" Could not determine robot ID");
        toast.warning(
          `Robot ${isEditMode ? "updated" : "added"} successfully, but could not automatically add buttons. Please add them manually.`
        );
        navigate(-1);
        return;
      }

      try {
        console.log(" Processing buttons for robot:", robotId);
        console.log(" Buttons to process:", formData.ActiveBtns);
        
        await postButtons(robotId, formData.ActiveBtns);
        console.log(" Buttons added successfully!");
      } catch (btnError) {
        console.error("Buttons operation failed:", btnError);
        toast.warning(
          `Robot ${isEditMode ? "updated" : "added"} successfully, but there was an issue with the buttons.`
        );
      }

      if (response?.success || response?.message?.toLowerCase().includes("success")) {
        toast.success(
          isEditMode ? "Robot updated successfully!" : "Robot added successfully!",
          { icon: <CheckCircle2 className="text-green-500" /> }
        );
        navigate(-1);
      } else {
        const errorMsg = response?.error || response?.message || "Failed to save robot";
        toast.error(errorMsg);
      }

    } catch (error) {
      console.error(" Main operation failed:", error);
      toast.error("Failed to save robot. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 sm:p-10">
      <div className="max-w-5xl w-full mx-auto mb-6 flex justify-start">
        <Button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="max-w-5xl w-full mx-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col gap-10"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-main-color">
            {isEditMode
              ? `Edit Robot ${projectName ? `– ${projectName}` : ""}`
              : `Add New Robot ${projectName ? `– ${projectName}` : ""}`}
          </h1>
          <div className="flex justify-center items-center gap-4 mt-2 flex-wrap">
            {projectId && (
              <p className="text-gray-600">
                Project ID:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {projectId}
                </span>
              </p>
            )}
            {isEditMode && (
              <p className="text-gray-600">
                Robot ID:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {id}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-main-color transition relative cursor-pointer">
          {formData.imagePreview ? (
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="w-full h-56 object-cover rounded-xl shadow-md mb-4"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <Upload size={40} className="mx-auto mb-3" />
              <p>Upload robot image</p>
              <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
            </div>
          )}
          <input
            id="Image"
            type="file"
            name="Image"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Robot Name *
            </label>
            <Input
              type="text"
              name="RobotName"
              value={formData.RobotName}
              onChange={handleChange}
              placeholder="Enter robot name"
              required
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Voltage *
            </label>
            <Input
              type="number"
              name="Voltage"
              value={formData.Voltage}
              onChange={handleChange}
              placeholder="Enter voltage"
              required
              step="0.1"
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Cycles *
            </label>
            <Input
              type="number"
              name="Cycles"
              value={formData.Cycles}
              onChange={handleChange}
              placeholder="Enter cycles"
              required
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Status
            </label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-main-color"
            >
              <option value="Running">Running</option>
              <option value="Stopped">Stopped</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-4">
              Select Active Buttons
            </label>
            <div className="flex flex-wrap gap-3">
              {availableButtons.map((btn) => {
                const isSelected = formData.ActiveBtns.find(
                  (b) => b.name === btn.name
                );
                return (
                  <Button
                    type="button"
                    key={btn.id}
                    onClick={() => handleButtonSelect(btn)}
                    className={`border rounded-xl px-5 py-2 transition-all ${
                      isSelected
                        ? "bg-main-color text-white border-main-color shadow-md"
                        : "bg-white text-main-color border-main-color hover:bg-main-color hover:text-white"
                    }`}
                  >
                    {btn.name}
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {formData.ActiveBtns.length} button(s)
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className={`cursor-pointer flex items-center gap-2 bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium transition-all ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Save size={22} />
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Update Robot"
                : "Add Robot"}
            </Button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
