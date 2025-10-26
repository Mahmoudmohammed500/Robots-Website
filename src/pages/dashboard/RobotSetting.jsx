import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RobotSettings({ robots }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const robot = robots.find((r) => r.id === parseInt(id)) || {
    name: "Unknown Robot",
    activeButtons: ["STOP", "START", "BACKWARD", "FORWARD"],
    availableButtons: ["SCHEDULING"],
  };

  const buttonColors = {
    STOP: "bg-red-500 hover:bg-red-600",
    START: "bg-green-500 hover:bg-green-600",
    BACKWARD: "bg-yellow-400 hover:bg-yellow-500 text-black",
    SCHEDULING: "bg-sky-500 hover:bg-sky-600",
    FORWARD: "bg-indigo-500 hover:bg-indigo-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col p-6 sm:p-10">
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

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-10"
      >
        {robot.name} Settings
      </motion.h1>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Active Buttons
          </h2>

          <div className="flex flex-wrap gap-5">
            <TooltipProvider>
              {robot.activeButtons.map((btn) => (
                <Tooltip key={btn}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        navigate(`/dashboard/robotSettings/${id}/button/${btn}`)
                      }
                      className={`${buttonColors[btn] || "bg-gray-400"} text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition relative`}
                    >
                      {btn}
                      <Settings
                        size={18}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-sm font-medium text-gray-700">Setting</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Available Buttons
          </h2>

          <div className="flex flex-wrap gap-5">
            <TooltipProvider>
              {robot.availableButtons.map((btn) => (
                <Tooltip key={btn}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        navigate(`buttonSettings/${btn}`)
                      }
                      className={`${buttonColors[btn] || "bg-gray-400"} text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition relative`}
                    >
                      {btn}
                      <Settings
                        size={18}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-sm font-medium text-gray-700">Setting</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
