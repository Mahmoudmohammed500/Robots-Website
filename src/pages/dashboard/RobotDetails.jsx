import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import RobotImg from "../../assets/Robot1.jpeg";

export default function RobotDetails({ projects }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = projects ? projects[0] : { title: "Omega Robotics Project" };

  const robot = {
    id,
    name: `Robot ${id}`,
    description:
      "This state-of-the-art robot integrates advanced AI algorithms and precision engineering, designed for seamless automation, inspection, and logistics. It delivers efficiency and accuracy at industrial scale.",
    image: RobotImg,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-gray-100 to-gray-200 flex flex-col p-4 sm:p-">
      <div className="w-3/4 mb-8 mx-auto">
        <Button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 bg-main-color text-white 
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
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-6/7 md:w-3/4 bg-white/80 backdrop-blur-md shadow-2xl mx-auto
                   rounded-3xl border border-gray-200 overflow-hidden 
                   grid grid-cols-1 lg:grid-cols-2"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative order-1 lg:order-2"
        >
          <img
            src={robot.image}
            alt={robot.name}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-5 left-6 text-white drop-shadow-md">
            <h2 className="text-2xl font-semibold">{robot.name}</h2>
          </div>
        </motion.div>

        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6 order-2 lg:order-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-bold text-gray-800"
          >
            {robot.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 leading-relaxed text-base sm:text-lg"
          >
            {robot.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2 text-gray-700"
          >
            <span className="font-medium">
              <span className="text-main-color font-semibold">Project:</span>{" "}
              {project.title}
            </span>
            <span>
              <span className="text-main-color font-semibold">Robot ID:</span>{" "}
              #{robot.id}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-6"
          >
            <Button
              onClick={() => navigate(`robotSettings/${robot.id}`)}
              className="cursor-pointer flex items-center gap-2 bg-second-color text-white border border-second-color 
                         hover:bg-white hover:text-second-color transition-all duration-300
                         px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium"
            >
              <Settings size={22} />
              Settings
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
