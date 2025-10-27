import { useState } from "react";
import {
  FolderKanban,
  PlusCircle,
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo omega-2022.png";

export default function DashboardSidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "All Projects", icon: FolderKanban, path: "/homeDashboard" },
    { name: "Add Project", icon: PlusCircle, path: "/homeDashboard/projectForm" },
    { name: "All Users", icon: Users, path: "/homeDashboard/allUsers" },
    { name: "Add User", icon: UserPlus, path: "/homeDashboard/addUser" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen max-lg:w-0">
      <div
        className={`hidden lg:flex fixed top-0 left-0 h-screen bg-linear-to-b from-main-color to-second-color text-white 
        shadow-2xl border-r border-main-color/20 z-50 transition-all duration-300 ease-in-out 
        ${isOpen ? "w-72" : "w-16"} flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between px-3 py-5 border-b border-white/10">
            {isOpen ? (
              <div
                className="flex items-center gap-3 pl-2 cursor-pointer"
                onClick={() => navigate("/login")}
                title="Go to Login"
              >
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
                onClick={() => navigate("/login")}
                title="Go to Login"
                className="h-10 w-10 object-contain mx-auto rounded-full bg-white p-1 cursor-pointer"
              />
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 ml-auto rounded-full transition shadow-md
                ${
                  isOpen
                    ? "hover:bg-white/20 text-white"
                    : "bg-white text-main-color hover:bg-white/90"
                }`}
              title={isOpen ? "Close Menu" : "Open Menu"}
            >
              {isOpen ? "×" : "›"}
            </button>
          </div>

          {/* Menu items */}
          <nav
            className={`flex flex-col gap-2 p-4 ${
              isOpen ? "overflow-y-auto" : "overflow-hidden"
            }`}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-3 py-2 px-2  rounded-lg font-medium w-full
                    transition duration-300 ${
                      active
                        ? "bg-white/20 text-white "
                        : "text-white/80 hover:bg-white/15 hover:text-white "
                    } ${!isOpen ? "justify-center" : ""}`}
                  >
                    <Icon size={22} />
                    {isOpen && <span>{item.name}</span>}
                  </button>

                  {!isOpen && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 bottom-[110%] bg-black/80 text-white text-xs px-2  rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-md"
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 flex flex-col ">
          <button
            onClick={() => navigate("/login")}
            className={`flex items-center gap-3 text-white/90 font-medium py-2 px-1 rounded-lg hover:bg-white/15 transition w-full ${
              !isOpen ? "justify-center" : "justify-start"
            }`}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>

          {isOpen && (
            <div className="mt-3 text-xs text-white/60 flex  ">
              <LayoutDashboard size={14} className="mb-1 me-2" />
              <span> © 2025 Dashboard</span>
            </div>
          )}
        </div>
      </div>

      <header className="lg:hidden fixed top-0 left-0 right-0 bg-linear-to-r from-main-color to-second-color text-white flex items-center justify-between px-4 py-3 z-50 shadow-md">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/login")}
          title="Go to Login"
        >
          <img
            src={Logo}
            alt="Logo"
            className="h-9 w-9 object-contain rounded-full bg-white p-1"
          />
          <div className="flex items-center gap-1 text-sm text-white/80">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="font-medium text-xs sm:text-sm">Admin</span>
          </div>
        </div>

        <nav className="flex items-center gap-4 sm:gap-5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                title={item.name}
                className={`relative group transition ${
                  active
                    ? "text-white drop-shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon size={22} />
                <span
                  className="absolute bottom-[120%] left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  {item.name}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => navigate("/login")}
            title="Logout"
            className="text-white/70 hover:text-white transition"
          >
            <LogOut size={22} />
          </button>
        </nav>
      </header>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto pt-[70px] lg:pt-0 
        ${isOpen ? "lg:pl-[18rem]" : "lg:pl-[4rem]"}`}
      >
        {children}
      </main>
    </div>
  );
}
