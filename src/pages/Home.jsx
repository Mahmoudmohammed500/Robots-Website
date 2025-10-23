import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center">
      {/* Hero Section */}
      <section className="w-full min-h-[80vh] flex items-center justify-center relative overflow-hidden px-6 bg-linear-to-r from-main-color/10 via-white to-second-color/10">
        <motion.div
          className="absolute inset-0 bg-[url('/images/robots-bg.webp')] bg-cover bg-center opacity-10"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Omega for Solar Panel Cleaning
          </motion.h1>

          <motion.p
            className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Revolutionizing solar maintenance with intelligent, autonomous, and
            sustainable cleaning robots — keeping your panels spotless and
            efficient all year long.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={() => navigate("/robots")}
              className="px-8 py-3 text-lg font-medium rounded-full border-2 
                         border-main-color text-main-color bg-white 
                         hover:bg-main-color hover:text-white 
                         transition-all duration-300 shadow-sm"
            >
              Your Robots
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}