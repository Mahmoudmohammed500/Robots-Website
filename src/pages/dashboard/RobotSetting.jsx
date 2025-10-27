import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RobotSettings() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [robot, setRobot] = useState(null);

  const allRobots = [
    {
      id: 1,
      name: "Robot Alpha",
      activeButtons: ["STOP", "START", "BACKWARD", "FORWARD"],
      availableButtons: ["SCHEDULING"],
    },
    {
      id: 2,
      name: "Robot Beta",
      activeButtons: ["STOP", "FORWARD"],
      availableButtons: ["SCHEDULING", "BACKWARD"],
    },
    {
      id: 3,
      name: "Robot Gamma",
      activeButtons: ["START", "FORWARD", "BACKWARD"],
      availableButtons: ["STOP"],
    },
  ];

  useEffect(() => {
    const found = allRobots.find((r) => r.id === parseInt(id));
    setRobot(found || null);
  }, [id]);

  if (!robot) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <p className="mb-4 text-lg font-medium">Loading robot settings...</p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color"
        >
          <ArrowLeft size={18} /> Back
        </Button>
      </div>
    );
  }

  const buttonColors = {
    STOP: "bg-red-500 hover:bg-red-600",
    START: "bg-green-500 hover:bg-green-600",
    BACKWARD: "bg-yellow-400 hover:bg-yellow-500 text-black",
    SCHEDULING: "bg-sky-500 hover:bg-sky-600",
    FORWARD: "bg-indigo-500 hover:bg-indigo-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col p-6 sm:p-10">
      {/* Back button */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white 
                     hover:bg-white hover:text-main-color border border-main-color 
                     rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-10"
      >
        {robot.name} Settings
      </motion.h1>

      {/* Lists */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-10">

        {/* Active Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Active Buttons
          </h2>
          {robot.activeButtons.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-5">
              {robot.activeButtons.map((btn) => (
                <Button
                  key={btn}
                  onClick={() =>
                    navigate(`/homeDashboard/robotSettings/${id}/button/${btn}`)
                  }
                  className={`${buttonColors[btn] || "bg-gray-400"} 
                              text-white text-lg font-semibold px-8 py-4 rounded-2xl 
                              shadow-md hover:shadow-lg transition`}
                >
                  {btn}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No active buttons</p>
          )}
        </motion.div>

        {/* Available Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
            Available Buttons
          </h2>
          {robot.availableButtons.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-5">
              {robot.availableButtons.map((btn) => (
                <div
                  key={btn}
                  className="flex flex-col items-center gap-2 bg-gray-50 border rounded-2xl p-4 shadow-sm"
                >
                  <span className="text-gray-700 font-medium">{btn}</span>
                  <Button
                    onClick={() =>
                      navigate(`/homeDashboard/robotSettings/${id}/button/${btn}`)
                    }
                    className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color rounded-lg transition"
                  >
                    <PlusCircle size={16} />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No available buttons</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
