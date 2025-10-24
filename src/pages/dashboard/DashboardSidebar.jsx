// src/components/dashboard/DashboardSidebar.jsx
import { useState } from "react";
import {
  X,
  FolderKanban,
  PlusCircle,
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo omega-2022.png";

export default function DashboardSidebar({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "All Projects", icon: FolderKanban, path: "/homeDashboard" },
    { name: "Add Project", icon: PlusCircle, path: "/homeDashboard/projects/add" },
    { name: "All Users", icon: Users, path: "/homeDashboard/users" },
    { name: "Add User", icon: UserPlus, path: "/homeDashboard/users/add" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-linear-to-b from-main-color to-second-color text-white
        shadow-2xl border-r border-main-color/20 z-40 transition-all duration-300 ease-in-out
        ${isOpen ? "w-72" : "w-16"} flex flex-col justify-between`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between px-3 py-5 border-b border-white/10">
            {isOpen ? (
              <div className="flex items-center gap-3 pl-2">
                <img
                  src={Logo}
                  alt="Admin Logo"
                  className="h-10 w-10 object-contain rounded-full bg-white p-1"
                />
                <div className="flex items-center gap-1 text-sm text-white/80">
                  <ShieldCheck size={18} className="text-green-400" />
                  <span className="font-medium">Admin</span>
                </div>
              </div>
            ) : (
              <img
                src={Logo}
                alt="Logo"
                className="h-10 w-10 object-contain mx-auto rounded-full bg-white p-1"
              />
            )}

            {/* Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 ml-auto rounded-full transition shadow-md
                ${isOpen
                  ? "hover:bg-white/20 text-white"
                  : "bg-white text-main-color hover:bg-white/90"}`}
              title={isOpen ? "Close Menu" : "Open Menu"}
            >
              {isOpen ? <X size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex flex-col gap-2 p-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg text-white/90 font-medium
                  hover:bg-white/15 hover:text-white transition duration-300 ${
                    !isOpen ? "justify-center" : ""
                  }`}
                >
                  <Icon size={20} />
                  {isOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-3 text-white/90 font-medium py-2 px-3 rounded-lg hover:bg-white/15 transition ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>

          {isOpen && (
            <div className="mt-6 text-center text-xs text-white/60">
              <LayoutDashboard size={14} className="inline-block mr-1" />
              <span>© 2025 Dashboard</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out p-6 overflow-y-auto`}
      >
        {children}
      </main>
    </div>
  );
}
