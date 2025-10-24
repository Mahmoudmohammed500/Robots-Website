import { Menu } from "lucide-react";

export default function DashboardNavbar({ toggleSidebar, sidebarOpen }) {
  return (
    <div className="fixed top-0 right-0 h-16 bg-white shadow-md border-b border-gray-200 z-30
      transition-all duration-300 ease-in-out"
      style={{ 
        marginLeft: sidebarOpen ? '18rem' : '4rem',
        width: sidebarOpen ? 'calc(100% - 18rem)' : 'calc(100% - 4rem)'
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <h1 className="font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </div>
      </div>
    </div>
  );
}