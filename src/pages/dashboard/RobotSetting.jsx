import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getData } from "@/services/getServices";

export default function RobotSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [robot, setRobot] = useState(null);
  const [mainButtons, setMainButtons] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const MAIN_COLOR = "#0d9488";

  const getButtonColor = (color) => color?.trim() || MAIN_COLOR;

  const extractButtonId = (btn) => {
    if (!btn) return null;
    if (typeof btn === "object") return btn.id || btn.Name || btn.BtnName;
    if (typeof btn === "string") return btn;
    return null;
  };

  const fetchButtonDetails = async (btn) => {
    const btnId = extractButtonId(btn);
    if (!btnId) return null;
    try {
      const btnDetails = await getData(`${BASE_URL}/buttons/${btnId}`);
      return {
        id: btnId,
        name: btnDetails.BtnName || btn.Name || btn.BtnName || btn.id || btn,
        color: getButtonColor(btnDetails.Color),
        section: "main",
      };
    } catch (err) {
      // fallback to robotData info if API fails
      return {
        id: btnId,
        name: btn.Name || btn.BtnName || btn.id || btn,
        color: getButtonColor(btn.Color),
        section: "main",
      };
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const robotData = await getData(`${BASE_URL}/robots/${id}`);
      setRobot(robotData);

      const mainBtns = [];

      // Main buttons
      if (robotData.Sections?.main?.ActiveBtns) {
        for (const btn of robotData.Sections.main.ActiveBtns) {
          const detailedBtn = await fetchButtonDetails(btn);
          if (detailedBtn) mainBtns.push(detailedBtn);
        }
      }

      setMainButtons(mainBtns);

    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleButtonClick = (btn) => {
    const btnId = extractButtonId(btn);
    if (!btnId) return alert("Invalid button data (missing id or name)");
    navigate(`/homeDashboard/robotSettings/${id}/button/${btnId}`);
  };

  const handleAddButton = () => {
    navigate(`/homeDashboard/robotSettings/${id}/button/new`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto mb-4"></div>
          Loading robot data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color transition-all duration-200"
        >
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        {robot?.RobotName} - Robot Settings
      </h1>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Buttons */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-green-700 mb-2">Robot Buttons</h3>
            <p className="text-gray-500">Total buttons: {mainButtons.length}</p>
          </div>
          {mainButtons.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {mainButtons.map((btn) => (
                <Button
                  key={btn.id}
                  onClick={() => handleButtonClick(btn)}
                  style={{ backgroundColor: btn.color, color: "#fff", border: `2px solid ${btn.color}` }}
                  className="px-6 py-3 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 min-w-[100px] hover:scale-105"
                >
                  {btn.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No active buttons</p>
          )}
        </div>

        {/* Add New Button */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-green-700 mb-2">Add New Robot Button</h3>
            <p className="text-gray-500">Add a new button to the main robot section</p>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Create custom buttons for your robot with specific operations and colors.
              </p>
            </div>

            <div className="flex gap-3 justify-center mt-4">
              <Button
                onClick={handleAddButton}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 transition-all"
              >
                <PlusCircle size={18} /> Add New Robot Button
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}