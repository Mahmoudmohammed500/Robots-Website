import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import HomeDashboard from "./HomeDashboard";
import ProjectDetails from "./ProjectDetails";
import imgRobot from "../../assets/Robot1.jpeg";

// Initial projects data
const initialProjects = [
  {
    id: 1,
    title: "AI Control System",
    description: "An intelligent system that manages robot behaviors autonomously.",
    image: imgRobot,
    location: "Cairo, Egypt",
  },
  {
    id: 2,
    title: "Robot Navigation",
    description: "Developing pathfinding algorithms for indoor environments.",
    image: imgRobot,
    location: "Dubai, UAE",
  },
  {
    id: 3,
    title: "Sensor Upgrade",
    description: "Upgrading sensors for higher precision and better obstacle detection.",
    image: imgRobot,
    location: "Berlin, Germany",
  },
];

// Simple page components
function AllProjects() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">All Projects</h1>
      <p>List of all projects...</p>
    </div>
  );
}

function AddProject() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Add New Project</h1>
      <p>Project creation form...</p>
    </div>
  );
}

function AllUsers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">All Users</h1>
      <p>List of all users...</p>
    </div>
  );
}

function AddUser() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Add New User</h1>
      <p>User creation form...</p>
    </div>
  );
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Function to delete a project
  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - fixed on large screens */}
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 lg:ml-0 transition-all duration-300 overflow-auto">
          <div className="pt-16 p-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomeDashboard 
                    projects={projects} 
                    onDeleteProject={handleDeleteProject}
                  />
                } 
              />
              <Route path="/projects" element={<AllProjects />} />
              <Route 
                path="/projectDetails/:id" 
                element={
                  <ProjectDetails 
                    projects={projects} 
                  />
                } 
              />
              <Route path="/projects/add" element={<AddProject />} />
              <Route path="/users" element={<AllUsers />} />
              <Route path="/users/add" element={<AddUser />} />

              {/* Fallback route */}
              <Route 
                path="*" 
                element={
                  <HomeDashboard 
                    projects={projects} 
                    onDeleteProject={handleDeleteProject}
                  />
                } 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
