import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, RefreshCcw, Play, StopCircle, ChevronUp, ChevronDown, Calendar } from "lucide-react";
import RobotImg from "../assets/Robot1.jpeg";

export default function RobotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectNumber = 1; 
  const robotId = id ? Number(id) : 1; 

  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const robot = {
    id: robotId,
    name: `X${robotId}-${projectNumber}`, 
    voltage: 27,
    cycles: 20,
    status: "Running",
    image: RobotImg,
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-white to-gray-50">

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          className="max-w-3xl mx-auto text-center bg-white rounded-3xl shadow-lg p-6 sm:p-10 border border-gray-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Image */}
          <div className="relative mb-4 sm:mb-6">
            <img
              src={robot.image}
              alt={robot.name}
              className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-2xl shadow-md"
            />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider mb-4 sm:mb-6 text-gray-900">
            {robot.name}
          </h2>

          {/* Info + Timer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div className="flex flex-col text-left text-base sm:text-lg font-medium text-gray-800 gap-2">
              <div>Voltage: <span className="font-semibold">{robot.voltage}</span></div>
              <div>Cycles: <span className="font-semibold">{robot.cycles}</span></div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-main-color animate-spin-slow" />
                <span>Status: {robot.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-lg sm:text-2xl font-bold text-gray-900">
              <span>⏱ {hours}:{minutes}:{seconds}</span>
              <RefreshCcw
                className="w-6 sm:w-8 h-6 sm:h-8 text-main-color cursor-pointer hover:text-main-color/70 transition"
                onClick={() => setSecondsLeft(getSecondsUntilMidnight())}
              />
            </div>
          </div>

          {/* Buttons with icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button className="flex items-center justify-center gap-2 bg-btn-red-bg hover:bg-btn-red-hover text-white font-bold py-3 rounded-lg shadow-md w-full">
              <StopCircle className="w-5 h-5" /> STOP
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-btn-green-bg hover:bg-btn-green-hover text-white font-bold py-3 rounded-lg shadow-md w-full">
              <Play className="w-5 h-5" /> START
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-btn-yellow-bg hover:bg-btn-yellow-hover text-black font-bold py-3 rounded-lg shadow-md w-full">
              <ChevronDown className="w-5 h-5" /> BACKWARD
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-btn-blue-bg hover:bg-btn-blue-hover text-white font-bold py-3 rounded-lg shadow-md w-full">
              <Calendar className="w-5 h-5" /> SCHEDULING
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-btn-indigo-bg hover:bg-btn-indigo-hover text-white font-bold py-3 rounded-lg shadow-md w-full">
              <ChevronUp className="w-5 h-5" /> FORWARD
            </Button>
          </div>

          {/* Back Button */}
          <div className="mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/robots")}
              className="border-main-color text-main-color hover:bg-main-color hover:text-white rounded-full px-6 py-2 sm:py-3"
            >
              Back to Robots
            </Button>
          </div>
        </motion.div>
      </main>

    </div>
  );
}
