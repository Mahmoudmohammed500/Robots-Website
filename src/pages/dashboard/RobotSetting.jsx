import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getData, postData } from "@/services/getServices";

export default function RobotSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [robot, setRobot] = useState(null);
  const [mainButtons, setMainButtons] = useState([]);
  const [carButtons, setCarButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newButtonName, setNewButtonName] = useState("");
  const [newButtonColor, setNewButtonColor] = useState("#0d9488");
  const [activeSection, setActiveSection] = useState("main");

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
        section: btn.section || "main",
      };
    } catch (err) {
      console.error(`Error fetching button ${btnId} details:`, err);
      // fallback to robotData info if API fails
      return {
        id: btnId,
        name: btn.Name || btn.BtnName || btn.id || btn,
        color: getButtonColor(btn.Color),
        section: btn.section || "main",
      };
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const robotData = await getData(`${BASE_URL}/robots/${id}`);
      setRobot(robotData);

      const mainBtns = [];
      const carBtns = [];

      // Main buttons
      if (robotData.Sections?.main?.ActiveBtns) {
        for (const btn of robotData.Sections.main.ActiveBtns) {
          const detailedBtn = await fetchButtonDetails(btn);
          if (detailedBtn) mainBtns.push(detailedBtn);
        }
      }

      // Car buttons (trolley)
      if (robotData.isTrolley === 1 && robotData.Sections?.car?.ActiveBtns) {
        for (const btn of robotData.Sections.car.ActiveBtns) {
          const detailedBtn = await fetchButtonDetails(btn);
          if (detailedBtn) carBtns.push(detailedBtn);
        }
      }

      setMainButtons(mainBtns);
      setCarButtons(carBtns);

    } catch (err) {
      console.error('Error fetching data:', err);
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

  const handleAddButton = async (section) => {
    const btnName = newButtonName.trim();
    if (!btnName) return alert("Please enter a valid button name");

    try {
      setAdding(true);
      setActiveSection(section);

      const newBtn = {
        BtnName: btnName,
        RobotId: parseInt(id),
        Color: newButtonColor,
        Operation: "/start",
        projectId: 10,
      };

      await postData(`${BASE_URL}/buttons?section=${section}`, newBtn);
      alert(`Button "${btnName}" added to ${section === 'car' ? 'Trolley' : 'Main Robot'} successfully!`);

      setNewButtonName("");
      setNewButtonColor(MAIN_COLOR);
      await fetchData();

    } catch (err) {
      console.error("Error adding button:", err);
      alert(`Failed to add button. Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto mb-4"></div>
          Loading data...
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
        {robot?.RobotName} - Settings
      </h1>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Buttons */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-green-700 mb-2">Main Robot Buttons</h3>
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

        {/* Trolley Buttons */}
        {robot?.isTrolley === 1 && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-purple-700 mb-2">Trolley Buttons</h3>
              <p className="text-gray-500">Total buttons: {carButtons.length}</p>
            </div>
            {carButtons.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {carButtons.map((btn) => (
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
              <p className="text-center text-gray-500 py-8">No active buttons for trolley</p>
            )}
          </div>
        )}

        {/* Add New Button */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Add New Button</h3>
            <p className="text-gray-500">Choose the section to add the button</p>
          </div>
          <div className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Button name..."
              value={newButtonName}
              onChange={(e) => setNewButtonName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-main-color focus:border-transparent"
            />
            <div className="flex items-center gap-4">
              <span>{newButtonColor}</span>
              <input
                type="color"
                value={newButtonColor}
                onChange={(e) => setNewButtonColor(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex gap-3 justify-center mt-4">
              <Button
                onClick={() => handleAddButton("main")}
                disabled={adding}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 transition-all ${activeSection === 'main' ? 'bg-green-600 text-white border-2 border-green-600' : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white'}`}
              >
                <PlusCircle size={18} /> {adding && activeSection === 'main' ? 'Adding...' : 'Add to Main'}
              </Button>

              {robot?.isTrolley === 1 && (
                <Button
                  onClick={() => handleAddButton("car")}
                  disabled={adding}
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 transition-all ${activeSection === 'car' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white'}`}
                >
                  <PlusCircle size={18} /> {adding && activeSection === 'car' ? 'Adding...' : 'Add to Trolley'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
