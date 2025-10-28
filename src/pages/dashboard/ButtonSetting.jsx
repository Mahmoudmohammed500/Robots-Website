import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";

export default function ButtonSetting() {
  const { id, buttonName } = useParams();
  const navigate = useNavigate();

  const [color, setColor] = useState("#4CAF50");

  // ✅ Load color from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("buttonColors") || "{}");
    if (stored[`${id}-${buttonName}`]) {
      setColor(stored[`${id}-${buttonName}`]);
    }
  }, [id, buttonName]);

  // ✅ Save color to localStorage (بدون لُوب)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("buttonColors") || "{}");
    stored[`${id}-${buttonName}`] = color;
    localStorage.setItem("buttonColors", JSON.stringify(stored));
  }, [color, id, buttonName]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white 
                     hover:bg-white hover:text-main-color border border-main-color 
                     rounded-xl shadow-md hover:shadow-lg transition-all mb-6 cursor-pointer"
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
          <h1 className="text-2xl font-bold text-main-color mb-8 text-center">
            {buttonName} Settings
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <Button className="bg-green-500 hover:bg-green-600 text-white cursor-pointer">
              Run
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer">
              Edit
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              Stop
            </Button>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">
            Choose Button Color
          </h2>

          <div className="flex flex-col items-center gap-6">
            <div className="w-60">
              <HexColorPicker color={color} onChange={setColor} />
            </div>

            <div
              className="w-20 h-20 rounded-full border shadow-md"
              style={{ backgroundColor: color }}
            ></div>

            <p className="text-gray-600 text-sm font-medium">
              Selected: <span className="font-semibold">{color}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
