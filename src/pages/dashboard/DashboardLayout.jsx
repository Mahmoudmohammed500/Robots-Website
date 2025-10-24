import { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { X, ChevronRight } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Area */}
      <div className="flex flex-col flex-1 bg-gray-50 min-w-0 transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="h-16 bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <ChevronRight size={20} className="text-gray-600" />
            )}
          </button>

          <div className="text-right">
            <h1 className="font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
