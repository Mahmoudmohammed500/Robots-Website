import { useState, useEffect } from "react";
import { Trash2, MapPin, ArrowRight, Edit3, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getData } from "@/services/getServices";
import { deleteData } from "@/services/deleteServices";
import { toast } from "sonner";

// Confirm Delete Modal
function ConfirmDeleteModal({
  project,
  onConfirm,
  onCancel,
  deleteAll = false,
}) {
  return (
    <AnimatePresence>
      {(project || deleteAll) && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border border-gray-200"
          >
            <XCircle
              size={48}
              className="mx-auto text-red-500 mb-4 animate-pulse"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              {deleteAll ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-main-color">
                    all projects
                  </span>
                  ? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-main-color">
                    {project?.ProjectName || "this project"}
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={onCancel}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onConfirm(deleteAll ? null : project?.projectId)}
                className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Component
export default function HomeDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteAll, setDeleteAll] = useState(false);

  // Fetch projects
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getData(`${BASE_URL}/projects`);
        setProjects(data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      }
    };
    fetchProjects();
    console.log("projects =", projects);
  }, []);

  // DELETE ALL projects
  const handleDeleteAll = async () => {
    try {
      const response = await deleteData(`${BASE_URL}/projects`);
      if (response?.success || response?.message?.includes("successfully")) {
        toast.success("All projects deleted successfully!");
        setProjects([]);
      } else {
        toast.error(response?.message || "Failed to delete all projects.");
      }
    } catch (error) {
      console.error("Error deleting all projects:", error);
      toast.error("Error deleting all projects. Please try again.");
    } finally {
      setDeleteAll(false);
    }
  };

  // DELETE single project
  const handleDeleteSingleProject = async (id) => {
    try {
      const response = await deleteData(`${BASE_URL}/projects/${id}`);
      if (response?.success || response?.message?.includes("deleted")) {
        toast.success("Project deleted successfully!");
        setProjects((prev) => prev.filter((p) => p.projectId !== id));
      } else {
        toast.error(response?.message || "Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project. Please try again.");
    } finally {
      setProjectToDelete(null);
    }
  };

  return (
    <div className="p-6 md:px-10 lg:px-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-800">All Projects</h1>

        {projects.length > 0 && (
          <Button
            className="flex items-center justify-center gap-2 cursor-pointer
                       bg-second-color text-white border border-second-color 
                       hover:bg-white hover:text-second-color transition-colors
                       text-sm sm:text-base md:text-lg 
                       px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3
                       rounded-xl shadow-md hover:shadow-lg "
            onClick={() => setDeleteAll(true)}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>Delete All</span>
          </Button>
        )}
      </div>

      {/* Cards */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const imageUrl = project.Image
              ? `${import.meta.env.VITE_UPLOADS_URL}/${project.Image.replace(/^uploads\//, "")}`
              : `${import.meta.env.VITE_UPLOADS_URL}/default.png`;
            return (
              <Card
                key={project.projectId}
                className="overflow-hidden shadow-lg pt-0 hover:shadow-xl transition rounded-xl border border-gray-200"
              >
                <img
                  src={imageUrl}
                  alt={project.ProjectName || "Project Image"}
                  className="h-56 w-full object-cover"
                />

                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {project.ProjectName || "Untitled Project"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {project.Description || "No description available."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={16} className="text-main-color" />
                    <span>{project.Location || "Unknown Location"}</span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      className="p-2 w-10 h-10 flex items-center cursor-pointer justify-center rounded-md bg-gray-600 text-white hover:bg-white hover:text-gray-600 hover:border-gray-600 transition-colors"
                      onClick={() =>
                        navigate(`projectDetails/${project.projectId}`)
                      }
                    >
                      <ArrowRight size={16} />
                    </Button>

                    <Button
                      className="p-2 w-10 h-10 flex items-center cursor-pointer justify-center rounded-md bg-main-color text-white hover:bg-white hover:text-main-color hover:border-main-color transition-colors"
                      onClick={() =>
                        navigate(`projectForm/${project.projectId}`)
                      }
                    >
                      <Edit3 size={16} />
                    </Button>

                    <Button
                      className="p-2 w-10 h-10 flex items-center cursor-pointer justify-center rounded-md bg-second-color text-white hover:bg-white hover:text-second-color hover:border-second-color transition-colors"
                      onClick={() => setProjectToDelete(project)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic mt-20 text-lg">
          No projects available.
        </div>
      )}

      {/* Confirm delete single project */}
      <ConfirmDeleteModal
        project={projectToDelete}
        onConfirm={handleDeleteSingleProject}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Confirm delete all projects */}
      <ConfirmDeleteModal
        deleteAll={deleteAll}
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAll(false)}
      />
    </div>
  );
}
