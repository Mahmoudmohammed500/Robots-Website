import { useEffect, useState } from "react";
import {
  Trash2,
  Edit3,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getData } from "@/services/getServices";
import { deleteData } from "@/services/deleteServices";
import RobotImg from "../../assets/Robot1.jpeg";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ConfirmDeleteModal component
function ConfirmDeleteModal({ robot = null, deleteAll = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
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
                <span className="font-semibold text-main-color">all robots</span>? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-main-color">{robot?.RobotName || "-"}</span>? This action cannot be undone.
              </>
            )}
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 rounded-xl transition-all cursor-pointer">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all cursor-pointer">
              Confirm
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState(null);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [robotToDelete, setRobotToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProjectAndRobots = async () => {
      try {
        setLoading(true);

        const projectData = await getData(`${BASE_URL}/projects/${id}`);
        setProject(projectData || {});

        const allRobots = await getData(`${BASE_URL}/robots`);
        if (Array.isArray(allRobots)) {
          const projectRobots = allRobots.filter((robot) => {
            const possibleProjectIds = [
              robot.projectId,
              robot.project_id,
              robot.ProjectId,
              robot.projectID,
              robot.ProjectID,
            ];
            return possibleProjectIds.some(pid => pid != null && String(pid) === String(id));
          });
          setRobots(projectRobots);
        } else {
          setRobots([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load project details.");
        setProject({});
        setRobots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndRobots();
  }, [id]);

  useEffect(() => {
    if (location.state?.shouldRefresh) {
      const refreshData = async () => {
        try {
          const allRobots = await getData(`${BASE_URL}/robots`);
          if (Array.isArray(allRobots)) {
            const projectRobots = allRobots.filter((robot) => {
              const possibleProjectIds = [
                robot.projectId,
                robot.project_id,
                robot.ProjectId,
                robot.projectID,
                robot.ProjectID,
              ];
              return possibleProjectIds.some(pid => pid != null && String(pid) === String(id));
            });
            setRobots(projectRobots);
          }
        } catch (error) {
          console.error("Error refreshing robots:", error);
        }
      };

      refreshData();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, id]);

  const handleDeleteRobot = async (robotId) => {
    try {
      await deleteData(`${BASE_URL}/robots/${robotId}`);
      setRobots(prev => prev.filter(r => r.id !== robotId));
      toast.success("Robot deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete robot.");
    } finally {
      setRobotToDelete(null);
    }
  };

  const handleDeleteAllRobots = async () => {
    try {
      for (const robot of robots) {
        await deleteData(`${BASE_URL}/robots/${robot.id}`);
      }
      setRobots([]);
      toast.success("All robots deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete all robots.");
    } finally {
      setShowDeleteAllModal(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 mb-4 text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <div className="text-second-color text-lg">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:px-10 lg:px-14">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 bg-main-color text-white border border-main-color hover:bg-white hover:text-main-color transition-colors px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>

      {/* Project Card */}
      <Card className="mb-8 shadow-lg rounded-xl border border-gray-200 pt-0">
        <CardHeader className="bg-linear-to-r from-main-color to-second-color text-white rounded-t-xl">
          <CardTitle className="text-2xl font-bold py-2">
            {project.ProjectName || "-"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4 text-lg">{project.Description || "-"}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold">Location:</span>
            <span>{project.Location || "-"}</span>
          </div>

          {project.Image && project.Image !== "Array" ? (
            <img
              src={`http://localhost/robots_web_apis/${project.Image}`}
              alt={project.ProjectName || "-"}
              className="h-64 w-full object-cover rounded-lg mt-4"
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Robots Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Robots</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 cursor-pointer bg-main-color text-white border border-main-color hover:bg-white hover:text-main-color px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
          >
            <PlusCircle size={18} /> Add Robot
          </Button>

          {robots.length > 0 && (
            <Button
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 cursor-pointer bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
            >
              <Trash2 size={18} /> Delete All Robots
            </Button>
          )}
        </div>
      </div>

      {/* Robots Grid */}
      {robots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <Card
              key={robot.id || Math.random()}
              className="overflow-hidden shadow-lg pt-0 hover:shadow-xl transition rounded-xl border border-gray-200"
            >
              {/* Robot Image */}
              <img
                src={
                  robot.Image
                    ? `http://localhost/robots_web_apis/${robot.Image}?t=${Date.now()}`
                    : RobotImg
                }
                alt={robot.RobotName || "-"}
                className="h-56 w-full object-cover"
              />

              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {robot.RobotName || "-"}
                </CardTitle>

                {/* Robot Stats */}
                <CardDescription className="text-gray-600 mt-1">
                  Voltage: {robot.Sections?.main?.Voltage || "-"}V — Cycles: {robot.Sections?.main?.Cycles || "-"}
                </CardDescription>
                <div className="text-gray-500 text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`font-semibold ${robot.Sections?.main?.Status === "Running" ? "text-green-600" : "text-second-color"}`}
                  >
                    {robot.Sections?.main?.Status || "-"}
                  </span>
                </div>

                {/* Trolley Status */}
                <div className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <span>Trolley:</span>
                  <span className="font-semibold">
                    {robot.isTrolley ? (
                      <span className="text-green-600 flex items-center gap-1">🟢 Yes</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">🔴 No</span>
                    )}
                  </span>
                </div>
              </CardHeader>

              {/* Active Buttons (main) */}
              <CardContent className="px-4 pb-4 flex flex-wrap gap-2 mt-2">
                {(() => {
                  let activeBtns = [];
                  try {
                    if (Array.isArray(robot.Sections?.main?.ActiveBtns)) {
                      activeBtns = robot.Sections.main.ActiveBtns;
                    } else if (typeof robot.Sections?.main?.ActiveBtns === "string") {
                      activeBtns = JSON.parse(robot.Sections.main.ActiveBtns);
                    }
                  } catch {
                    activeBtns = [];
                  }

                  return activeBtns.length > 0 ? (
                    activeBtns.map((btn, i) => {
                      const btnLabel =
                        typeof btn?.Name === "string"
                          ? btn.Name
                          : typeof btn?.name === "string"
                          ? btn.name
                          : "-";
                      return (
                        <button
                          key={btn.id || i}
                          className="px-4 py-1.5 rounded-lg border text-sm font-medium bg-main-color text-white border-main-color hover:bg-white hover:text-main-color transition-all"
                        >
                          {btnLabel}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-sm italic">No active buttons</span>
                  );
                })()}
              </CardContent>

              {/* Robot Actions */}
              <CardContent className="px-4 pb-4 flex gap-2 mt-2">
                <Button
                  variant="outline"
                  className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-gray-600 text-white hover:bg-white hover:text-gray-600 transition-colors"
                  onClick={() => navigate(`/homeDashboard/robotDetails/${robot.id}`)}
                >
                  <ArrowRight size={16} />
                </Button>

                <Button
                  variant="outline"
                  className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                  onClick={() => navigate(`/homeDashboard/editRobot/${robot.id}`, {
                    state: { projectId: id, projectName: project.ProjectName || "-" },
                  })}
                >
                  <Edit3 size={16} />
                </Button>

                <Button
                  variant="outline"
                  className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-second-color text-white hover:bg-white hover:text-second-color transition-colors"
                  onClick={() => setRobotToDelete(robot)}
                >
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic mt-20 text-lg">
          No robots available for this project.
        </div>
      )}

      {/* Confirm Delete Modals */}
      {robotToDelete && (
        <ConfirmDeleteModal
          robot={robotToDelete}
          onConfirm={() => handleDeleteRobot(robotToDelete.id)}
          onCancel={() => setRobotToDelete(null)}
        />
      )}
      {showDeleteAllModal && (
        <ConfirmDeleteModal
          deleteAll={true}
          onConfirm={handleDeleteAllRobots}
          onCancel={() => setShowDeleteAllModal(false)}
        />
      )}

      {/* Add Robot Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Choose Robot Type
              </h2>
              <p className="text-gray-600 mb-6">
                Please select the type of robot you want to add.
              </p>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    navigate(`/homeDashboard/addRobotw/${id}`, {
                      state: { projectId: id, projectName: project.ProjectName || "-", type: "withTrolley" },
                    });
                  }}
                  className="bg-main-color text-white border border-main-color hover:bg-white hover:text-main-color px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Add Robot with Trolley
                </Button>

                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    navigate(`/homeDashboard/addRobotOnly/${id}`, {
                      state: { projectId: id, projectName: project.ProjectName || "-", type: "robotOnly" },
                    });
                  }}
                  className="bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Add Robot Only
                </Button>

                <Button
                  onClick={() => setShowAddModal(false)}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl transition-all"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
