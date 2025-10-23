import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4"
        >
          <Loader2 className="w-12 h-12 text-blue-600" />
        </motion.div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading...
        </h2>
        
        <p className="text-gray-600">
          Please wait while we prepare your experience
        </p>
      </motion.div>
    </div>
  );
}