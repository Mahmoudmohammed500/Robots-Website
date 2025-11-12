import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getData } from "@/services/getServices";
import { putData } from "@/services/putServices";
import Loading from "@/pages/Loading";
import RobotMainPanel from "@/components/robots/RobotMainPanel";
import RobotTrolleyPanel from "@/components/robots/RobotTrolleyPanel";

export default function EditRobot() {
  const navigate = useNavigate();
  const { id: robotId } = useParams();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTrolley, setShowTrolley] = useState(false);

  // Fetch robot data
  useEffect(() => {
    const fetchRobot = async () => {
      try {
        setLoading(true);
        console.log("Fetching robot with ID:", robotId);
        
        const data = await getData(`${BASE_URL}/robots.php/${robotId}`);
        console.log("Fetched robot data:", data);
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error("No robot data found");
        }

        const mainSection = data.Sections?.main || {};
        const carSection = data.Sections?.car || {};

        console.log("Main section:", mainSection);
        console.log("Car section:", carSection);

        const processedRobot = {
          RobotName: data.RobotName || "",
          Image: data.Image || null,
          imagePreview: data.Image
            ? `${UPLOADS_URL}/${data.Image}`
            : "/assets/placeholder-robot.jpg",
          mqttUrl: data.mqttUrl || "",
          isTrolley: data.isTrolley == 1 || data.isTrolley === "true" || data.isTrolley === true,
          Sections: {
            main: {
              Voltage: mainSection.Voltage || "",
              Cycles: mainSection.Cycles || "",
              Status: mainSection.Status || "Stopped",
              Topic_subscribe: mainSection.Topic_subscribe || "robot/main/in",
              Topic_main: mainSection.Topic_main || "robot/main/out",
            },
            car: (data.isTrolley == 1 || data.isTrolley === "true" || data.isTrolley === true)
              ? {
                  Voltage: carSection.Voltage || "",
                  Cycles: carSection.Cycles || "",
                  Status: carSection.Status || "Stopped",
                  Topic_subscribe: carSection.Topic_subscribe || "robot/car/in",
                  Topic_main: carSection.Topic_main || "robot/car/out",
                }
              : null,
          },
        };

        console.log("Processed robot:", processedRobot);
        setRobot(processedRobot);
        setShowTrolley(data.isTrolley == 1 || data.isTrolley === "true" || data.isTrolley === true);
      } catch (err) {
        console.error("Error fetching robot:", err);
        toast.error("Failed to load robot data.");
      } finally {
        setLoading(false);
      }
    };

    if (robotId) {
      fetchRobot();
    }
  }, [robotId, BASE_URL, UPLOADS_URL]);

  // Update functions
  const updateRobotName = (name) => {
    console.log("Updating robot name to:", name);
    setRobot((prev) => ({ ...prev, RobotName: name }));
  };

  const updateMqttUrl = (url) => {
    console.log("Updating MQTT URL to:", url);
    setRobot((prev) => ({ ...prev, mqttUrl: url }));
  };

  const updateImage = (file, preview) => {
    console.log("Updating image:", file, preview);
    setRobot((prev) => ({ ...prev, Image: file, imagePreview: preview }));
  };

  const updateMainSection = (updates) => {
    console.log("Updating main section:", updates);
    setRobot((prev) => ({
      ...prev,
      Sections: { 
        ...prev.Sections, 
        main: { ...prev.Sections.main, ...updates } 
      },
    }));
  };

  const updateCarSection = (updates) => {
    console.log("Updating car section:", updates);
    setRobot((prev) => ({
      ...prev,
      Sections: { 
        ...prev.Sections, 
        car: { ...prev.Sections.car, ...updates } 
      },
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!robot?.RobotName) {
      toast.warning("Please enter robot name");
      return;
    }

    if (!robot.mqttUrl) {
      toast.warning("Please enter MQTT URL");
      return;
    }

    if (!robot.Sections.main.Voltage || !robot.Sections.main.Cycles) {
      toast.warning("Please fill main section Voltage & Cycles");
      return;
    }

    if (showTrolley && (!robot.Sections.car?.Voltage || !robot.Sections.car?.Cycles)) {
      toast.warning("Please fill trolley section Voltage & Cycles");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        RobotName: robot.RobotName,
        Image: robot.Image instanceof File ? robot.Image.name : robot.Image,
        mqttUrl: robot.mqttUrl,
        isTrolley: showTrolley ? 1 : 0,
        Sections: {
          main: {
            ...robot.Sections.main,
            Voltage: Number(robot.Sections.main.Voltage),
            Cycles: Number(robot.Sections.main.Cycles),
          },
        },
      };

      if (showTrolley && robot.Sections.car) {
        payload.Sections.car = {
          ...robot.Sections.car,
          Voltage: Number(robot.Sections.car.Voltage),
          Cycles: Number(robot.Sections.car.Cycles),
        };
      }

      console.log("PUT payload:", JSON.stringify(payload, null, 2));

      const res = await putData(`${BASE_URL}/robots.php/${robotId}`, payload);

      if (res && (res.success || res.message?.toLowerCase().includes("success"))) {
        toast.success("Robot updated successfully!");
        navigate(-1);
      } else {
        toast.error("Failed to update robot info.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error while updating robot.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!robot) return <div className="min-h-screen flex items-center justify-center">Robot not found</div>;

  console.log("=== FINAL ROBOT DATA BEFORE RENDER ===");
  console.log("Robot Name:", robot?.RobotName);
  console.log("MQTT URL:", robot?.mqttUrl);
  console.log("Main Voltage:", robot?.Sections?.main?.Voltage);
  console.log("Main Cycles:", robot?.Sections?.main?.Cycles);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 sm:p-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-main-color">Edit Robot</h1>
            <p className="text-sm text-gray-500 mt-1">
              Robot ID: <span className="font-mono">{robotId}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white border text-main-color"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-main-color text-white"
            >
              {submitting ? "Saving..." : "Update Robot"}
            </Button>
          </div>
        </div>

        {/* TROLLEY SECTION */}
        {showTrolley && robot.Sections.car && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-main-color mb-2">
              Trolley Control
            </h2>
            <RobotTrolleyPanel
              carData={robot.Sections.car}
              updateCarSection={updateCarSection}
              imagePreview={robot.imagePreview}
              updateImage={updateImage}
            />
          </section>
        )}

        {/* ROBOT SECTION */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-main-color mb-2">Robot</h2>
          <RobotMainPanel
            mainData={robot.Sections.main}
            updateMainSection={updateMainSection}
            robotName={robot.RobotName}
            updateRobotName={updateRobotName}
            imagePreview={robot.imagePreview}
            updateImage={updateImage}
            mqttUrl={robot.mqttUrl}
            updateMqttUrl={updateMqttUrl}
          />
        </section>
      </div>
    </motion.div>
  );
}