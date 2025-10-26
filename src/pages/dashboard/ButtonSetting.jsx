import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ButtonSetting({ robots = [] }) {
  const { id, buttonName } = useParams();
  const navigate = useNavigate();

  const robot = robots.find((r) => r.id === parseInt(id));

  const isActive = robot?.activeButtons.includes(buttonName);

  const colorOptions = [
    { name: "Red", class: "bg-red-500" },
    { name: "Green", class: "bg-green-500" },
    { name: "Yellow", class: "bg-yellow-400" },
    { name: "Blue", class: "bg-sky-500" },
    { name: "Indigo", class: "bg-indigo-500" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Gray", class: "bg-gray-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white 
                     hover:bg-white hover:text-main-color border border-main-color 
                     rounded-xl shadow-md hover:shadow-lg transition-all mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200"
        >
          <h1 className="text-2xl font-bold text-main-color mb-4 text-center">
            {buttonName} Settings
          </h1>

          <div className="flex justify-center gap-4 mb-8">
            {isActive ? (
              <>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Edit
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Stop
                </Button>
              </>
            ) : (
              <>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  Run
                </Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Edit
                </Button>
              </>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">
            Choose Button Color
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 justify-items-center">
            {colorOptions.map((color) => (
              <div
                key={color.name}
                className={`${color.class} w-10 h-10 rounded-full cursor-pointer border-2 border-white hover:scale-110 transition-transform`}
                title={color.name}
              ></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
