import { useState } from "react";
import { Trash2, MapPin, X, ArrowRight, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard({ projects, onDeleteProject }) {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showProjectConfirm, setShowProjectConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleDeleteAll = () => {
    // delete all projects
    projects.forEach(project => onDeleteProject(project.id));
    setShowConfirm(false);
  };

  const handleDeleteSingleProject = (id) => {
    onDeleteProject(id);
    setShowProjectConfirm(false);
    setSelectedProject(null);
  };

  return (
    <div className="p-6 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">All Projects</h1>
        {projects.length > 0 && (
          <Button
            className="flex items-center gap-2 bg-second-color text-white hover:bg-white hover:text-second-color border border-second-color transition-colors shadow"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>

      {/* Cards Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="overflow-hidden pt-0 shadow-lg hover:shadow-xl transition rounded-xl border border-gray-200">
              <img src={project.image} alt={project.title} className="h-56 pt-0 mt-0 w-full object-cover" />

              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-xl font-semibold text-gray-800">{project.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">{project.description}</CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin size={16} className="text-main-color" />
                  <span>{project.location}</span>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-2 mt-2">
                  {/* Go to Project */}
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                    onClick={() => navigate(`/projectDetails/${project.id}`)}
                  >
                    <ArrowRight size={16} />
                  </Button>

                  {/* Edit Project */}
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                  >
                    <Edit3 size={16} />
                  </Button>

                  {/* Delete Project */}
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-second-color text-white hover:bg-white hover:text-second-color transition-colors"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectConfirm(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic mt-20 text-lg">
          No projects available.
        </div>
      )}

      {/* Confirm Delete All */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6 relative">
            <button onClick={() => setShowConfirm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete all projects?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-second-color text-second-color hover:bg-second-color hover:text-white transition-colors">No</Button>
              <Button className="bg-second-color text-white hover:bg-white hover:text-second-color border border-second-color transition-colors" onClick={handleDeleteAll}>Yes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Project */}
      {showProjectConfirm && selectedProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6 relative">
            <button onClick={() => setShowProjectConfirm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete "{selectedProject.title}"?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this project?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowProjectConfirm(false)} className="border-second-color text-second-color hover:bg-second-color hover:text-white transition-colors">No</Button>
              <Button className="bg-second-color text-white hover:bg-white hover:text-second-color border border-second-color transition-colors" onClick={() => handleDeleteSingleProject(selectedProject.id)}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}