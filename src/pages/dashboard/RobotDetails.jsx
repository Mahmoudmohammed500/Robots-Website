import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Loading from "@/pages/Loading";
import RobotImg from "../../assets/Robot1.jpeg";
import { getData } from "@/services/getServices"; // API helper

export default function RobotDetails() {
  const { id } = useParams(); // robotId
  const navigate = useNavigate();
  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRobot = async () => {
      try {
        setLoading(true);
        const data = await getData(`/robots.php/${id}`);
        setRobot(data);
      } catch (err) {
        console.error("Failed to fetch robot:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRobot();
  }, [id]);

  if (loading) return <Loading />;

  if (!robot) {
    return (
      <div className="p-6 text-center text-red-500">
        Robot not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6">
      <div className="w-3/4 mb-8 mx-auto">
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-6/7 md:w-3/4 bg-white/80 backdrop-blur-md shadow-2xl mx-auto
                   rounded-3xl border border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2"
      >
        <motion.div className="relative order-1 lg:order-2">
          <img
            src={robot.Image ? `http://localhost/robots_web_apis/${robot.Image}` : RobotImg}
            alt={robot.RobotName}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-5 left-6 text-white drop-shadow-md">
            <h2 className="text-2xl font-semibold">{robot.RobotName}</h2>
          </div>
        </motion.div>

        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6 order-2 lg:order-1">
          <motion.h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {robot.RobotName}
          </motion.h1>

          <motion.p className="text-gray-600 leading-relaxed text-base sm:text-lg">
            {robot.Description || "No description available."}
          </motion.p>

          <div className="flex flex-col gap-2 text-gray-700">
            {robot.ProjectName && (
              <span className="font-medium">
                <span className="text-main-color font-semibold">Project:</span> {robot.ProjectName}
              </span>
            )}
            <span>
              <span className="text-main-color font-semibold">Robot ID:</span> #{robot.id}
            </span>
          </div>

          <div className="pt-6">
            <Button
              onClick={() => navigate(`/homeDashboard/robotSettings/${robot.id}`)}
              className="flex items-center gap-2 bg-second-color text-white border border-second-color 
                         hover:bg-white hover:text-second-color transition-all duration-300
                         px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium cursor-pointer" 
            >
              <Settings size={22} />
              Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
