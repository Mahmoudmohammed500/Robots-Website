import React, { useEffect, useState, useRef } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Loader, 
  Bell, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  ArrowLeft,
  Filter,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationCenter({ 
  onClose, 
  mode = "dropdown",
  position = "header"
}) {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [robots, setRobots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentProject, setCurrentProject] = useState(null);
  const [robotsLoaded, setRobotsLoaded] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCurrentProjectAndNotifications();
  }, []);

  useEffect(() => {
    if (robotsLoaded && notifications.length > 0) {
      applyFilters();
    }
  }, [notifications, searchTerm, filterType, robotsLoaded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const getProjectNameFromCookie = () => {
    try {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "projectName") {
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchProjectByName = async (projectName) => {
    try {
      if (!projectName) return null;

      const res = await axios.get(`${API_BASE}/projects.php`);
      const projects = Array.isArray(res.data) ? res.data : [];

      const project = projects.find(
        (proj) =>
          proj.ProjectName &&
          proj.ProjectName.trim().toLowerCase() === projectName.trim().toLowerCase()
      );

      return project || null;
    } catch (err) {
      return null;
    }
  };

  const fetchAllRobots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/robots.php`);
      const robotsArray = Array.isArray(res.data) ? res.data : [];
      return robotsArray;
    } catch (err) {
      console.error("Failed to fetch robots:", err);
      return [];
    }
  };

  const isAlertNotification = (note) => {
    return note.type === 'alert';
  };

  const findSectionByTopic = (topicMain, robot) => {
    if (!topicMain || !robot.Sections) return null;
    
    const sectionEntry = Object.entries(robot.Sections).find(
      ([sectionName, section]) => section.Topic_main === topicMain
    );

    return sectionEntry ? sectionEntry[0] : null;
  };

  const findRobotByTopic = (topicMain) => {
    if (!topicMain || !robots.length) return null;
    
    for (const robot of robots) {
      if (!robot.Sections) continue;
      
      for (const [sectionName, section] of Object.entries(robot.Sections)) {
        if (section.Topic_main === topicMain) {
          return robot;
        }
      }
    }
    
    return null;
  };

  const getRobotNameByRobotId = (robotId) => {
    if (!robotId || !robots.length) {
      return "Loading...";
    }
    
    const searchId = robotId.toString().trim();
    
    const robot = robots.find(r => {
      return r.id != null && r.id.toString() === searchId;
    });
    
    if (robot) {
      const robotName = robot.RobotName || robot.robotName || robot.name || 'Unknown Robot';
      return robotName;
    }
    
    return "Robot Not Found";
  };

  const getSectionNameFromTopic = (topic) => {
    if (!topic) return "Unknown Section";
    
    const parts = topic.split('/');
    if (parts.length >= 2) {
      const sectionType = parts[1];
      if (sectionType === 'car') {
        return 'Trolley';
      } else if (sectionType === 'main') {
        return 'Robot';
      }
      return sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
    }
    return "Unknown Section";
  };

  const getRobotNameFromTopic = (topic) => {
    if (!topic) return "Unknown Robot";
    
    const parts = topic.split('/');
    if (parts.length > 0) {
      const robotNameFromTopic = parts[0];
      if (robotNameFromTopic && robotNameFromTopic !== 'robot') {
        return robotNameFromTopic.charAt(0).toUpperCase() + robotNameFromTopic.slice(1);
      }
    }
    return "Unknown Robot";
  };

  const getRobotAndSectionInfo = (note) => {
    if (!note) return { robotName: "Loading...", sectionName: "Loading..." };
    
    let robotName = "Unknown Robot";
    let sectionName = "Unknown Section";

    if (note.RobotId) {
      robotName = getRobotNameByRobotId(note.RobotId);
    }

    if ((!robotName || robotName === "Robot Not Found") && note.topic_main) {
      const robotFromTopic = findRobotByTopic(note.topic_main);
      if (robotFromTopic) {
        robotName = robotFromTopic.RobotName || robotFromTopic.robotName || "Unknown Robot";
      }
    }

    if ((!robotName || robotName === "Robot Not Found") && note.topic_main) {
      robotName = getRobotNameFromTopic(note.topic_main);
    }

    if (note.topic_main) {
      sectionName = getSectionNameFromTopic(note.topic_main);
    }

    return { robotName, sectionName };
  };

  const fetchCurrentProjectAndNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      setRobotsLoaded(false);

      const projectName = getProjectNameFromCookie();
      const project = await fetchProjectByName(projectName);
      setCurrentProject(project);

      const allRobots = await fetchAllRobots();
      setRobots(allRobots);
      setRobotsLoaded(true);

      const res = await axios.get(`${API_BASE}/notifications.php`, {
        headers: { "Content-Type": "application/json" },
      });
      
      const allNotifications = Array.isArray(res.data) ? res.data : [];

      const sortedNotifications = allNotifications.sort((a, b) => {
        try {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB - dateA;
        } catch {
          return 0;
        }
      });

      setNotifications(sortedNotifications);
      
    } catch (err) {
      setError("Failed to load notifications: " + (err.message || "Unknown error"));
      setRobotsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!robotsLoaded) return;

    let filtered = [...notifications];

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.topic_main?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === "alerts") {
      filtered = filtered.filter(note => isAlertNotification(note));
    } else if (filterType === "notifications") {
      filtered = filtered.filter(note => !isAlertNotification(note));
    }

    setFilteredNotifications(filtered);
  };

  const handleClickNotification = async (note) => {
    try {
      let robotId = note.RobotId;
      let sectionName = null;
      let robotName = null;

      if (!robotId && note.topic_main) {
        const robotFromTopic = findRobotByTopic(note.topic_main);
        if (robotFromTopic) {
          robotId = robotFromTopic.id;
          robotName = robotFromTopic.RobotName;
          sectionName = findSectionByTopic(note.topic_main, robotFromTopic);
        }
      }

      if (!robotId && currentProject) {
        const projectRobots = robots.filter(r => 
          r.projectId && parseInt(r.projectId) === parseInt(currentProject.projectId)
        );
        if (projectRobots.length > 0) {
          robotId = projectRobots[0].id;
          robotName = projectRobots[0].RobotName;
        }
      }

      if (!robotId) {
        alert("Cannot open this robot. Missing RobotId or cannot find associated robot.");
        return;
      }
      
      navigate(`/robots/${robotId}`, {
        state: {
          section: sectionName,
          fromNotification: true,
          notificationData: note,
          robotName: robotName
        },
      });

      if (onClose) onClose();
    } catch (error) {
      alert("Error opening robot details. Please try again.");
    }
  };

  const getNotificationClasses = (note) => {
    const isAlert = isAlertNotification(note);
    const base = "mb-2 p-3 hover:shadow-md cursor-pointer transition-all duration-200 border rounded-lg";
    
    if (isAlert) return `${base} bg-red-50 border-red-200 hover:border-red-300`;
    return `${base} bg-blue-50 border-blue-200 hover:border-blue-300`;
  };

  const getTitleColor = (note) => {
    if (isAlertNotification(note)) return "text-red-800";
    return "text-blue-800";
  };

  const getNotificationIcon = (note) => {
    if (isAlertNotification(note))
      return <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />;
    return <Bell className="w-4 h-4 text-blue-500 mr-2" />; 
  };

  const getNotificationType = (note) => {
    return isAlertNotification(note) ? "Alert" : "Notification";
  };

  const handleBackToDashboard = () => {
    navigate("/homeDashboard");
  };

  const getProjectDisplayName = () => {
    if (currentProject) {
      return currentProject.ProjectName || "Unknown Project";
    }
    return "All Projects";
  };

  // Render different layouts based on mode
  if (mode === "page") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-main-color" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Notifications Dashboard</h1>
                  {/* <p className="text-gray-600">Project: {getProjectDisplayName()}</p> */}
                </div>
              </div>
            </div>

            <Button
              onClick={fetchCurrentProjectAndNotifications}
              className="flex items-center gap-2 bg-main-color hover:bg-second-color"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  All
                </Button>
                <Button
                  variant={filterType === "alerts" ? "default" : "outline"}
                  onClick={() => setFilterType("alerts")}
                  className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Alerts
                </Button>
                <Button
                  variant={filterType === "notifications" ? "default" : "outline"} 
                  onClick={() => setFilterType("notifications")}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                >
                  <Bell className="w-4 h-4" /> 
                  Notifications
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alert Notifications</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {notifications.filter(note => isAlertNotification(note)).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Normal Notifications</p> 
                    <p className="text-2xl font-bold text-gray-800">
                      {notifications.filter(note => !isAlertNotification(note)).length}
                    </p>
                  </div>
                  <Bell className="w-8 h-8 text-green-500" /> 
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-main-color mr-3" />
                <span className="text-gray-500 text-lg">Loading notifications...</span>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <Button
                  onClick={fetchCurrentProjectAndNotifications}
                  className="bg-main-color hover:bg-second-color"
                >
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && filteredNotifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || filterType !== "all" 
                    ? "No notifications match your filters" 
                    : "No notifications found"}
                </p>
                {(searchTerm || filterType !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}

            {!loading && !error && filteredNotifications.length > 0 && (
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    Sorted by: Newest First
                  </Badge>
                </div>

                <div className="space-y-4">
                  {filteredNotifications.slice(0, 10).map((note, i) => {
                    const isAlert = isAlertNotification(note);
                    const { robotName, sectionName } = getRobotAndSectionInfo(note);
                    
                    return (
                      <Card
                        key={note.notificationId || i}
                        className={getNotificationClasses(note)}
                        onClick={() => handleClickNotification(note)}
                      >
                        <CardHeader className="p-0 pb-3">
                          <div className="">
                            <CardTitle
                              className={`text-base font-semibold line-clamp-2 flex items-start ${getTitleColor(
                                note
                              )}`}
                            >
                              {getNotificationIcon(note)}
                              <span className="">{note.message}</span>
                            </CardTitle>
                            <Badge
                              variant={isAlert ? "destructive" : "secondary"}
                              className="ml-2"
                            >
                              {getNotificationType(note)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="flex justify-between items-center">
                            <p
                              className={`text-sm ${
                                isAlert ? "text-red-600" : "text-blue-600"
                              }`}
                            >
                              {note.date} • {note.time}
                            </p>

                            {note.topic_main && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isAlert
                                    ? "bg-red-200 text-red-800"
                                    : "bg-blue-200 text-blue-800"
                                }`}
                              >
                                {note.topic_main}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            <div>
                              {sectionName && (
                                <p className="text-sm text-gray-500">
                                  <strong>Section:</strong> {sectionName}
                                </p>
                              )}
                              {note.topic_main && (
                                <p className="text-sm text-gray-500">
                                  <strong>Topic:</strong> {note.topic_main}
                                </p>
                              )}
                            </div>
                            {note.RobotId && (
                              <p className="text-sm text-gray-500">
                                <strong>Robot ID:</strong> {note.RobotId}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {isAlert && (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-600 font-medium">Priority Alert</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              View Robot Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={`
        fixed md:absolute 
        top-16 md:top-full 
        right-4 md:right-0
        left-4 md:left-auto
        h-[75vh] md:h-auto 
        w-[calc(100%-2rem)] md:w-80 lg:w-96 
        md:max-h-[80vh] 
        bg-white 
        shadow-2xl rounded-lg 
        border border-gray-200 
        overflow-hidden 
        z-50
        transform transition-all duration-300 ease-in-out
        ${position === "sidebar" ? "md:left-0 md:right-auto" : "md:right-0"}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-main-color text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-white/80">
                Project: {getProjectDisplayName()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCurrentProjectAndNotifications}
              className="text-white hover:text-gray-200 transition-colors p-1"
              title="Refresh notifications"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
              title="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm h-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className="flex-1 text-xs h-8"
            >
              All
            </Button>
            <Button
              variant={filterType === "alerts" ? "default" : "outline"}
              onClick={() => setFilterType("alerts")}
              className="flex-1 text-xs h-8 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Alerts
            </Button>
            <Button
              variant={filterType === "notifications" ? "default" : "outline"} 
              onClick={() => setFilterType("notifications")}
              className="flex-1 text-xs h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
            >
              <Bell className="w-3 h-3 mr-1" /> 
              Notifications
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(75vh-220px)] md:max-h-[60vh] overflow-y-auto">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-6 h-6 animate-spin text-main-color mr-2" />
            <span className="text-gray-500 text-sm">Loading notifications...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 text-sm mb-2">{error}</p>
            <button
              onClick={fetchCurrentProjectAndNotifications}
              className="text-main-color text-sm hover:underline font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-1">
              {getProjectDisplayName() === "All Projects" 
                ? "No notifications found" 
                : `No notifications for ${getProjectDisplayName()}`}
            </p>
            {(searchTerm || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="text-main-color text-sm hover:underline font-medium mt-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="p-3">
            <div className="mb-3 flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                Newest First
              </Badge>
            </div>

            <div className="space-y-2">
              {filteredNotifications.slice(0, 10).map((note, i) => {
                const isAlert = isAlertNotification(note);
                const { robotName, sectionName } = getRobotAndSectionInfo(note);
                
                return (
                  <Card
                    key={note.notificationId || i}
                    className={getNotificationClasses(note)}
                    onClick={() => handleClickNotification(note)}
                  >
                    <CardHeader className="p-0 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle
                          className={`text-sm font-semibold line-clamp-2 flex items-start ${
                            isAlert ? "text-red-800" : "text-blue-800"
                          }`}
                        >
                          {getNotificationIcon(note)}
                          <span className="flex-1">{note.message}</span>
                        </CardTitle>
                        <Badge
                          variant={isAlert ? "destructive" : "secondary"}
                          className="ml-2 text-xs"
                        >
                          {getNotificationType(note)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-2">
                        <p
                          className={`text-xs ${
                            isAlert ? "text-red-600" : "text-blue-600"
                          }`}
                        >
                          {note.date} • {note.time}
                        </p>

                        {note.topic_main && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isAlert
                                ? "bg-red-200 text-red-800"
                                : "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {note.topic_main}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div>
                          <p className="text-xs text-gray-500">
                            <strong>Robot name:</strong> {robotName}
                          </p>
                        </div>
                        <div>
                          {sectionName && sectionName !== "Unknown Section" && (
                            <p className="text-xs text-gray-500">
                              <strong>Section:</strong> {sectionName}
                            </p>
                          )}
                          {note.topic_main && (
                            <p className="text-xs text-gray-500">
                              <strong>Topic:</strong> {note.topic_main}
                            </p>
                          )}
                        </div>
                        {note.RobotId && (
                          <p className="text-xs text-gray-500">
                            <strong>Robot ID:</strong> {note.RobotId}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {isAlert && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-600 font-medium">Priority</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!loading && filteredNotifications.length > 0 && (
        <div className="border-t p-3 bg-gray-50">
          <button
            onClick={fetchCurrentProjectAndNotifications}
            className="w-full text-center text-sm text-main-color hover:text-second-color font-medium py-1 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Notifications
          </button>
        </div>
      )}
    </div>
  );
}