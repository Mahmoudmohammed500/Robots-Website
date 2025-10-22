import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success(" تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 
      bg-white/60 backdrop-blur-md border-b border-gray-50
      flex items-center justify-between px-8 py-3"
    >
      {/* logo */}
      <div className="flex items-center gap-2 select-none ">
        <h1 className="text-2xl font-serif font-semibold tracking-widest text-gray-900">
          LOGO
        </h1>
      </div>

{/* project name */}
      <div className="flex items-center gap-5 text-gray-700">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-2 rounded-full">
            <User className="w-5 h-5 text-gray-700" />
          </div>
          <span className="font-medium cursor-pointer ">اسم المشروع</span>
        </div>

{/* log out */}
        <div
          onClick={handleLogout}
          className="flex items-center gap-1 cursor-pointer hover:text-second-color transition-all duration-300"
        >
          <span className="font-medium">تسجيل الخروج</span>
          <LogOut className="w-4 h-4" />
        </div>
      </div>
    </nav>
  );
}
