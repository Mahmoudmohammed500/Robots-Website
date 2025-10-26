import { useState } from "react";
import { Trash2, Edit3, PlusCircle, ArrowRight, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import RobotImg from "../../assets/Robot1.jpeg";

export default function ProjectDetails({ projects }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === parseInt(id));

  const [robots, setRobots] = useState([
    {
      id: 1,
      name: "Robot Alpha",
      description: "Performs automated assembly tasks.",
      image: RobotImg,
    },
    {
      id: 2,
      name: "Robot Beta",
      description: "Handles quality inspection in production line.",
      image: RobotImg,
    },
    {
      id: 3,
      name: "Robot Gamma",
      description: "Supports logistics and material handling.",
      image: RobotImg,
    },
  ]);

  const [showRobotConfirm, setShowRobotConfirm] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState(null);

  const handleDeleteRobot = (id) => {
    setRobots((prev) => prev.filter((r) => r.id !== id));
    setShowRobotConfirm(false);
    setSelectedRobot(null);
  };

  const handleDeleteAll = () => {
    setRobots([]);
  };

  if (!project) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 mb-4 text-lg">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:px-10 lg:px-14">
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white border border-main-color 
                     hover:bg-white hover:text-main-color transition-colors
                     px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>

      {/* Project Info Card */}
      <Card className="mb-8 shadow-lg rounded-xl border border-gray-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-main-color to-second-color text-white rounded-t-xl">
          <CardTitle className="text-2xl font-bold py-2">
            {project.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4 text-lg">{project.description}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold">Location:</span>
            <span>{project.location}</span>
          </div>
        </CardContent>
      </Card>

      {/* Robots Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Robots</h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Robot */}
          <Button
            onClick={() => navigate("/homeDashboard/addRobot")}
            className="
              flex items-center justify-center gap-2 
              bg-main-color text-white border border-main-color 
              hover:bg-white hover:text-main-color transition-colors
              text-sm sm:text-base md:text-lg 
              px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3
              rounded-xl shadow-md hover:shadow-lg
            "
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>Add Robot</span>
          </Button>

          {/* Delete All Robots */}
          <Button
            onClick={handleDeleteAll}
            className="
              flex items-center justify-center gap-2 
              bg-second-color text-white border border-second-color 
              hover:bg-white hover:text-second-color transition-colors
              text-sm sm:text-base md:text-lg 
              px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3
              rounded-xl shadow-md hover:shadow-lg
            "
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <span>Delete All</span>
          </Button>
        </div>
      </div>

      {/* Robots Grid */}
      {robots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <Card
              key={robot.id}
              className="overflow-hidden shadow-lg pt-0 hover:shadow-xl transition rounded-xl border border-gray-200"
            >
              <img
                src={robot.image}
                alt={robot.name}
                className="h-56 w-full object-cover"
              />

              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {robot.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {robot.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-4 flex gap-2 mt-2">
                {/* Edit Robot */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-md bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                  >
                    <Edit3 size={16} />
                  </Button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                    Edit
                  </span>
                </div>

                {/* Delete Robot */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-md bg-second-color text-white hover:bg-white hover:text-second-color transition-colors"
                    onClick={() => {
                      setSelectedRobot(robot);
                      setShowRobotConfirm(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                    Delete
                  </span>
                </div>

                {/* Go to Robot Details */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-md bg-gray-600 text-white hover:bg-white hover:text-gray-600 transition-colors"
                    onClick={() =>
                      navigate(`/homeDashboard/robotDetails/${robot.id}`)
                    }
                  >
                    <ArrowRight size={16} />
                  </Button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">
                    Go
                  </span>
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

      {/* Confirm Delete Robot */}
      {showRobotConfirm && selectedRobot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6 relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Delete "{selectedRobot.name}"?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this robot?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRobotConfirm(false)}
                className="border-second-color text-second-color hover:bg-second-color hover:text-white transition-colors"
              >
                No
              </Button>
              <Button
                className="bg-second-color text-white hover:bg-white hover:text-second-color border border-second-color transition-colors"
                onClick={() => handleDeleteRobot(selectedRobot.id)}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
