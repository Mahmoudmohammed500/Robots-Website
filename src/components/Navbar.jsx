import { LogOut, Menu, X, UserCheck } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  //logout handler
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-3">
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/home")}
        >
          <motion.img
            src="/images/logo omega-2022.png"
            alt="Logo"
            className="h-9 w-auto object-contain"
            whileHover={{ scale: 1.05 }}
          />
        </div>

        {/* Project Name (Always Visible) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/robots")}
        >
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 tracking-tight whitespace-nowrap">
            <span className="text-main-color">Project</span>{" "}
            <span className="text-second-color">Name</span>
          </h1>
          <UserCheck className="w-5 h-5 text-main-color" />
        </div>

        {/* Desktop Logout */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={handleLogout}
            className="border border-main-color text-main-color 
            hover:bg-main-color hover:text-white 
            transition-all duration-300 rounded-full px-5 py-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-main-color hover:bg-main-color/10 transition"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-md"
          >
            <div className="flex flex-col items-center py-4 space-y-3">
              <Button
                onClick={handleLogout}
                className="w-[90%] border border-main-color text-main-color 
                hover:bg-main-color hover:text-white 
                transition-all duration-300 rounded-full py-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
