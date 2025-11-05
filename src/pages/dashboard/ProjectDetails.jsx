import { useEffect, useState } from "react";
import { Trash2, Edit3, PlusCircle, ArrowLeft, ArrowRight, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { getData } from "@/services/getServices";
import { deleteData } from "@/services/deleteServices";
import RobotImg from "../../assets/Robot1.jpeg";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Confirm Delete Modal Component
function ConfirmDeleteModal({
  robot = null,
  deleteAll = false,
  onConfirm,
  onCancel,
}) {
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
                <span className="font-semibold text-main-color">
                  all robots
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-main-color">
                  {robot?.RobotName}
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
              onClick={onConfirm}
              className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all cursor-pointer"
            >
              Confirm
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProjectDetails() {
  const { id } = useParams(); // projectId
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for delete modals
  const [robotToDelete, setRobotToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    const fetchProjectAndRobots = async () => {
      try {
        const projectData = await getData(`/projects.php/${id}`);
        setProject(projectData);

        // Fetch robots and filter locally if API doesn't support query param
        try {
          const robotsData = await getData(`/robots.php/${id}`);
          if (Array.isArray(robotsData)) {
            setRobots(robotsData);
          } else {
            const all = await getData("/robots.php/${id}");
            setRobots((all || []).filter((r) => String(r.projectId) === String(id) || String(r.project_id) === String(id)));
          }
        } catch (err) {
          const all = await getData("/robots.php/${id}");
          setRobots((all || []).filter((r) => String(r.projectId) === String(id) || String(r.project_id) === String(id)));
        }
      } catch (error) {
        console.error("Error fetching project or robots:", error);
        toast.error("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndRobots();
  }, [id]);

  const handleDeleteRobot = async (robotId) => {
    try {
      await deleteData(`/robots.php/${robotId}`);
      setRobots((prev) => prev.filter((r) => r.id !== robotId));
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
        await deleteData(`/robots.php/${robot.id}`);
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
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 bg-main-color text-white border border-main-color 
                     hover:bg-white hover:text-main-color transition-colors
                     px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>

      {/* Project card */}
      <Card className="mb-8 shadow-lg rounded-xl border border-gray-200 pt-0">
        <CardHeader className="bg-linear-to-r from-main-color to-second-color text-white rounded-t-xl">
          <CardTitle className="text-2xl font-bold py-2">
            {project.ProjectName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4 text-lg">{project.Description}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold">Location:</span>
            <span>{project.Location}</span>
          </div>

          {project.Image && project.Image !== "Array" && (
            <img
              src={`http://localhost/robots_web_apis/${project.Image}`}
              alt={project.ProjectName}
              className="h-64 w-full object-cover rounded-lg mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Robots header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Robots</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() =>
              navigate(`/homeDashboard/addRobot/${id}`, {
                state: { projectId: id, projectName: project.ProjectName },
              })
            }
            className="flex items-center gap-2 cursor-pointer bg-main-color text-white border border-main-color hover:bg-white hover:text-main-color px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
          >
            <PlusCircle size={18} /> Add Robot
          </Button>

          {robots.length > 0 && (
            <Button
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 cursor-pointer bg-second-color text-white border border-secondbg-second-color hover:bg-white hover:text-second-color px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
            >
              <Trash2 size={18} /> Delete All Robots
            </Button>
          )}
        </div>
      </div>

      {/* Robots grid */}
      {robots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <Card
              key={robot.id}
              className="overflow-hidden shadow-lg pt-0 hover:shadow-xl transition rounded-xl border border-gray-200"
            >
              <img
                src={
                  robot.Image
                    ? `http://localhost/robots_web_apis/${robot.Image}`
                    : RobotImg
                }
                alt={robot.RobotName}
                className="h-56 w-full object-cover"
              />
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {robot.RobotName}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Voltage: {robot.Voltage}V — Cycles: {robot.Cycles}
                </CardDescription>
                <div className="text-gray-500 text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      robot.Status === "Running" ? "text-green-600" : "text-secondbg-second-color"
                    }`}
                  >
                    {robot.Status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 flex flex-wrap gap-2 mt-2">
                {(() => {
                  let activeBtns = [];

                  if (Array.isArray(robot.ActiveBtns)) {
                    activeBtns = robot.ActiveBtns;
                  } else if (typeof robot.ActiveBtns === "string") {
                    try {
                      activeBtns = JSON.parse(robot.ActiveBtns);
                    } catch {
                      activeBtns = [];
                    }
                  }

                 //  ignore undefined or empty BtnName
return activeBtns
  .filter(
    (btn) =>
      btn &&
      (btn.BtnName || btn.name) &&
      (btn.BtnName !== "undefined" && btn.name !== "undefined")
  )
  .map((btn, i) => (
    <Button
      key={btn.BtnID || btn.id || i}
      className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-main-color hover:text-white transition-all px-3 py-1 text-sm rounded-lg"
    >
      {btn.BtnName || btn.name || "Button"}
    </Button>
  ));

                })()}
              </CardContent>

              <CardContent className="px-4 pb-4 flex gap-2 mt-2">
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-gray-600 text-white hover:bg-white hover:text-gray-600 transition-colors"
                    onClick={() => navigate(`/homeDashboard/robotDetails/${robot.id}`)}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>

                <div className="relative group">
                  <Button
                    variant="outline"
                    className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                    onClick={() =>
                      navigate(`/homeDashboard/editRobot/${robot.id}`, {
                        state: { projectId: id, projectName: project.ProjectName },
                      })
                    }
                  >
                    <Edit3 size={16} />
                  </Button>
                </div>

                <div className="relative group">
                  <Button
                    variant="outline"
                    className="cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-md bg-second-color text-white hover:bg-white hover:text-second-color transition-colors"
                    onClick={() => setRobotToDelete(robot)}
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
          No robots available for this project.
        </div>
      )}

      {/* Confirm delete single robot modal */}
      {robotToDelete && (
        <ConfirmDeleteModal
          robot={robotToDelete}
          onConfirm={() => handleDeleteRobot(robotToDelete.id)}
          onCancel={() => setRobotToDelete(null)}
        />
      )}

      {/* Confirm delete all robots modal */}
      {showDeleteAllModal && (
        <ConfirmDeleteModal
          deleteAll={true}
          onConfirm={handleDeleteAllRobots}
          onCancel={() => setShowDeleteAllModal(false)}
        />
      )}
    </div>
  );
}