import { useState } from "react";
import { Trash2, X, Edit3, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import RobotImg from "../../assets/Robot1.jpeg";

export default function ProjectDetails({ projects }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const project = projects.find(p => p.id === parseInt(id));

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
    setRobots(prev => prev.filter(r => r.id !== id));
    setShowRobotConfirm(false);
    setSelectedRobot(null);
  };

  if (!project) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 mb-4 text-lg">Project not found.</div>
        <div className="text-gray-400 mb-6">Project ID: {id}</div>
        <Button 
          onClick={() => navigate('/')}
          className="bg-main-color text-white"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-main-color border-main-color hover:bg-main-color hover:text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Button>
        <span className="text-gray-500 italic">All Robotics for this project</span>
      </div>

      {/* Project Info Card */}
      <Card className="mb-8 shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="bg-linear-to-r from-main-color to-second-color text-white rounded-t-xl">
          <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Robots</h2>
        <span className="text-gray-500">{robots.length} robots</span>
      </div>

      {/* Robots Grid */}
      {robots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map(robot => (
            <Card key={robot.id} className="overflow-hidden shadow-lg hover:shadow-xl transition rounded-xl border border-gray-200">
              <img src={robot.image} alt={robot.name} className="h-56 w-full object-cover" />

              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-xl font-semibold text-gray-800">{robot.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">{robot.description}</CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-4">
                {/* Buttons Row */}
                <div className="flex gap-2 mt-2">
                  {/* Edit Robot */}
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-main-color text-white hover:bg-white hover:text-main-color transition-colors"
                  >
                    <Edit3 size={16} />
                  </Button>

                  {/* Delete Robot */}
                  <Button
                    variant="outline"
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-second-color text-white hover:bg-white hover:text-second-color transition-colors"
                    onClick={() => {
                      setSelectedRobot(robot);
                      setShowRobotConfirm(true);
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
          No robots available for this project.
        </div>
      )}

      {/* Confirm Delete Robot */}
      {showRobotConfirm && selectedRobot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6 relative">
            <button
              onClick={() => setShowRobotConfirm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Delete "{selectedRobot.name}"?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this robot?</p>
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