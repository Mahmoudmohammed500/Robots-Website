import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, RefreshCcw } from "lucide-react";
import { getData } from "@/services/getServices";
import { toast } from "sonner";
import axios from "axios";
import TabsHeader from "@/components/robots/TabsHeader";
import UserNotificationsTab from "@/components/robots/UserNotificationsTab";
import UserLogsTab from "@/components/robots/UserLogsTab";

const getRobotImageSrc = (image) => {
  if (!image || image === "" || image === "Array" || image === "null") return "/default-robot.jpg";
  if (image.startsWith('http')) return image;
  return `http://localhost/robots_web_apis/${image}`;
};

// LazyImage 
function LazyImage({ src, alt, className, fallbackSrc }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return <img src={currentSrc} alt={alt} className={className} onError={handleError} loading="lazy" />;
}

export default function RobotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonColors, setButtonColors] = useState({});
  const [activeTab, setActiveTab] = useState("controls");
  const [activeTrolleyTab, setActiveTrolleyTab] = useState("controls");
  const [isResetting, setIsResetting] = useState(false);
  
  const timerRef = useRef(null);
  const [displayTime, setDisplayTime] = useState("24:00:00");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchRobotData = async () => {
    try {
      setLoading(true);
      if (location.state?.robot) {
        setRobot(location.state.robot);
        return;
      }
      const robotData = await getData(`${BASE_URL}/robots/${id}`);
      if (!robotData) {
        toast.error("Robot not found in API");
        return;
      }
      setRobot(robotData);
    } catch (error) {
      toast.error("Failed to load robot details");
    } finally {
      setLoading(false);
    }
  };

  const fetchButtonColors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/buttons.php`);
      const colorsMap = {};
      res.data.forEach(btn => {
        colorsMap[btn.BtnID] = btn.Color;
      });
      setButtonColors(colorsMap);
    } catch (err) {
      console.error("Failed to load button colors:", err);
    }
  };

  useEffect(() => {
    fetchRobotData();
    fetchButtonColors();
    
    startTimer();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); 
    let totalSeconds = Math.floor((midnight - now) / 1000); 
    
    if (totalSeconds < 0) {
      totalSeconds += 24 * 60 * 60;
    }

    const updateTimer = () => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setDisplayTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
      
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        totalSeconds = 24 * 60 * 60;
      }
    };

    updateTimer();
    
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const handleResetTimer = () => {
    setIsResetting(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    let totalSeconds = 24 * 60 * 60; 
    
    const updateTimer = () => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setDisplayTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
      
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        totalSeconds = 24 * 60 * 60;
      }
    };

    updateTimer();
    
    timerRef.current = setInterval(updateTimer, 1000);
    
    toast.success("Timer reset to 24:00:00");
    
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  };

  const tabs = [
    { id: "controls", label: "Controls" },
    { id: "notifications", label: "Notifications" },
    { id: "logs", label: "Logs" },
  ];

  const trolleyTabs = [
    { id: "controls", label: "Controls" },
    { id: "notifications", label: "Notifications" },
    { id: "logs", label: "Logs" },
  ];

  const getActiveButtons = (section, sectionType = "main") => {
    if (!section || !section.ActiveBtns) return [];

    let activeBtns = [];
    try {
      if (Array.isArray(section.ActiveBtns)) activeBtns = section.ActiveBtns;
      else if (typeof section.ActiveBtns === "string") activeBtns = JSON.parse(section.ActiveBtns);
    } catch {
      activeBtns = [];
    }

    return activeBtns.map((btn, i) => {
      const btnLabel = btn?.Name || btn?.name || `Button ${i + 1}`;
      const btnColor = buttonColors[btn.id] || "#cccccc";
      return (
        <button
          key={btn?.id || i}
          className="px-6 py-4 rounded-xl text-lg font-semibold text-white border shadow-lg transition-all duration-300 transform hover:scale-105 min-w-[150px] sm:min-w-[180px] lg:min-w-[200px]"
          style={{ backgroundColor: btnColor, borderColor: btnColor }}
        >
          {buttonColors[btn.id] ? btnLabel : `${btnLabel} (Unavailable)`}
        </button>
      );
    });
  };

  const renderRobotControls = () => {
    const { RobotName, Image, Sections = {} } = robot;
    const mainSection = Sections?.main || {};
    const imageSrc = getRobotImageSrc(Image);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Robot Image and Name */}
        <div className="relative mb-6">
          <LazyImage 
            src={imageSrc} 
            alt={RobotName || "Robot"} 
            className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-2xl shadow-md" 
            fallbackSrc="/default-robot.jpg" 
          />
        </div>
        
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider mb-6 text-gray-900 text-center">
          {RobotName || "Unnamed Robot"}
        </h2>

        {/* Info + Timer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
          <div className="flex flex-col text-left text-base sm:text-lg font-medium text-gray-800 gap-2">
            <div>Voltage: <span className="font-semibold">{mainSection.Voltage || "0"}V</span></div>
            <div>Cycles: <span className="font-semibold">{mainSection.Cycles || "0"}</span></div>
            <div className="flex items-center gap-2">
              <RotateCcw className={`w-5 h-5 ${mainSection.Status === "Running" ? "text-green-500 animate-spin-slow" : "text-gray-400"}`} />
              <span>Status: <span className={`font-semibold ml-1 ${mainSection.Status === "Running" ? "text-green-600" : mainSection.Status === "Idle" ? "text-yellow-600" : "text-gray-600"}`}>
                {mainSection.Status || "Unknown"}
              </span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-lg sm:text-2xl font-bold text-gray-900">
            <span>⏱ {displayTime}</span>
            <RefreshCcw 
              className={`w-6 sm:w-8 h-6 sm:h-8 text-main-color cursor-pointer hover:text-main-color/70 transition-transform duration-600 ${
                isResetting ? 'rotate-180' : ''
              }`}
              onClick={handleResetTimer}
              title="Reset timer to 24 hours"
            />
          </div>
        </div>

        {/* Active Buttons */}
        {mainSection.ActiveBtns && mainSection.ActiveBtns.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {getActiveButtons(mainSection, "main")}
            </div>
          </div>
        )}

        {/* Topic Information */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Connection Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Subscribe Topic:</span>
              <p className="text-gray-600 mt-1 font-mono text-sm bg-white p-2 rounded border">
                {mainSection.Topic_subscribe || "Not configured"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Publish Topic:</span>
              <p className="text-gray-600 mt-1 font-mono text-sm bg-white p-2 rounded border">
                {mainSection.Topic_main || "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTrolleyControls = () => {
    const { Sections = {} } = robot;
    const carSection = Sections?.car || {};

    return (
      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 border border-gray-100 mt-8" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold tracking-wider mb-6 text-second-color text-center">
          Trolley Controls
        </h2>
        
        {/* Trolley Data */}
        <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center mb-8 gap-4 sm:gap-0">
          <div className="flex flex-col text-left text-base sm:text-lg font-medium text-gray-800 gap-2">
            <div>Voltage: <span className="font-semibold">{carSection.Voltage || "0"}V</span></div>
            <div>Cycles: <span className="font-semibold">{carSection.Cycles || "0"}</span></div>
            <div className="flex items-center gap-2">
              <RotateCcw className={`w-5 h-5 ${carSection.Status === "Running" ? "text-green-500 animate-spin-slow" : "text-gray-400"}`} />
              <span>Status: <span className={`font-semibold ml-1 ${carSection.Status === "Running" ? "text-green-600" : carSection.Status === "Idle" ? "text-yellow-600" : "text-gray-600"}`}>
                {carSection.Status || "Unknown"}
              </span></span>
            </div>
          </div>
        </div>

        {/* Trolley Buttons */}
        {carSection.ActiveBtns && carSection.ActiveBtns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {getActiveButtons(carSection, "car")}
          </div>
        )}

        {/* Trolley Topic Information */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Trolley Connection Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Subscribe Topic:</span>
              <p className="text-gray-600 mt-1 font-mono text-sm bg-white p-2 rounded border">
                {carSection.Topic_subscribe || "Not configured"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Publish Topic:</span>
              <p className="text-gray-600 mt-1 font-mono text-sm bg-white p-2 rounded border">
                {carSection.Topic_main || "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-b from-white to-gray-50">
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading robot details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!robot) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-b from-white to-gray-50">
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <p className="text-gray-500 text-lg">Robot not found</p>
            <Button
              onClick={() => navigate("/robots")}
              className="mt-4 border-main-color text-main-color hover:bg-main-color hover:text-white rounded-full px-6 py-3"
            >
              Back to Robots
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { Sections = {} } = robot;
  const hasTrolley = Sections?.car && (
    Sections.car.Voltage || 
    Sections.car.Cycles || 
    Sections.car.Status || 
    (Sections.car.ActiveBtns && Sections.car.ActiveBtns.length > 0)
  );

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-white to-gray-50">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div 
          className="max-w-6xl mx-auto" 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          {/* Robot Tabs Header */}
          <div className="bg-white rounded-t-3xl shadow-lg p-6 border-b border-gray-200">
            <TabsHeader 
              tabs={tabs} 
              active={activeTab} 
              onChange={setActiveTab} 
              accent="main" 
            />
          </div>

          {/* Robot Tab Content */}
          <div className="bg-white rounded-b-3xl shadow-lg p-6 sm:p-10 border border-gray-100">
            {activeTab === "controls" && renderRobotControls()}
            
            {activeTab === "notifications" && (
              <UserNotificationsTab 
                robotId={id} 
                sectionName="main" 
              />
            )}
            
            {activeTab === "logs" && (
              <UserLogsTab 
                sectionName="main" 
              />
            )}
          </div>

          {/* Trolley Section - Only if trolley data exists */}
          {hasTrolley && (
            <>
              {/* Trolley Tabs Header */}
              <div className="bg-white rounded-t-3xl shadow-lg p-6 border-b border-gray-200 mt-12">
                <TabsHeader 
                  tabs={trolleyTabs} 
                  active={activeTrolleyTab} 
                  onChange={setActiveTrolleyTab} 
                  accent="second" 
                />
              </div>

              {/* Trolley Tab Content */}
              <div className="bg-white rounded-b-3xl shadow-lg p-6 sm:p-10 border border-gray-100">
                {activeTrolleyTab === "controls" && renderTrolleyControls()}
                
                {activeTrolleyTab === "notifications" && (
                  <UserNotificationsTab 
                    robotId={id} 
                    sectionName="car" 
                  />
                )}
                
                {activeTrolleyTab === "logs" && (
                  <UserLogsTab 
                    sectionName="car" 
                  />
                )}
              </div>
            </>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/robots")} 
              className="border-main-color text-main-color hover:bg-main-color hover:text-white rounded-full px-8 py-4 text-lg font-semibold transition-all"
            >
              Back to Robots
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}