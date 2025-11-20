import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TabsHeader from "@/components/robots/TabsHeader";
import NotificationsTab from "@/components/robots/NotificationsTab";
import LogsTab from "@/components/robots/LogsTab";
import ScheduleSettings from "@/components/robots/ScheduleSettings";
import RobotMainPanelView from "@/components/robots/RobotPanelDetails";
import TrolleyPanelDetails from "@/components/robots/TrolleyPanelDetails";
import { toast } from "sonner";
import Loading from "@/pages/Loading";
import { getData } from "@/services/getServices";
import useMqtt from "@/hooks/useMqtt";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function RobotDetailsFull() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;
  const [robot, setRobot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trolleyTab, setTrolleyTab] = useState("control");
  const [robotTab, setRobotTab] = useState("control");

  const fetchRobot = async () => {
    try {
      const data = await getData(`${BASE_URL}/robots.php/${id}`);
      setRobot(data || {});
    } catch (err) {}
  };

  const handleCyclesUpdate = (robotId, sectionName, newCycles) => {
    if (robotId == id) {
      setRobot((prevRobot) => {
        if (
          !prevRobot ||
          !prevRobot.Sections ||
          !prevRobot.Sections[sectionName]
        ) {
          return prevRobot;
        }

        const updatedRobot = {
          ...prevRobot,
          Sections: {
            ...prevRobot.Sections,
            [sectionName]: {
              ...prevRobot.Sections[sectionName],
              Cycles: newCycles,
            },
          },
        };

        return updatedRobot;
      });
    } else {
    }
  };

  // mqtt setup   onCyclesUpdate
  const { client, isConnected, publishMessage } = useMqtt({
    host: "bc501a2acdf343aa811f1923d9af4727.s1.eu.hivemq.cloud",
    port: 8884,
    clientId: "clientId-1Kyy79c7WB",
    username: "testrobotsuser",
    password: "Testrobotsuser@1234",
    onCyclesUpdate: handleCyclesUpdate,
  });

  // MQTT subscribe helper
  const subscribe = (topic) => {
    if (client && client.subscribe) {
      client.subscribe(topic);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (id && isConnected) {
        fetchRobot();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id, isConnected]);

  useEffect(() => {
    if (!isConnected || !robot) return;

    Object.values(robot.Sections).forEach((section) => {
      if (section.Topic_publish) subscribe(section.Topic_publish);
    });
  }, [isConnected, robot]);

  // mqtt subscribe to robot topics
  useEffect(() => {
    if (!isConnected || !robot) return;

    Object.values(robot.Sections || {}).forEach((section) => {
      if (section.Topic_subscribe) {
        subscribe(section.Topic_subscribe);
      }
    });
  }, [isConnected, robot]);

  useEffect(() => {
    const loadRobot = async () => {
      try {
        setLoading(true);
        const data = await getData(`${BASE_URL}/robots.php/${id}`);
        setRobot(data || {});
      } catch (err) {
        toast.error("Failed to load robot data");
        setRobot({});
      } finally {
        setLoading(false);
      }
    };

    loadRobot();
  }, [id]);

  const getActiveButtons = () => {
    if (!robot || !robot.Sections?.main?.ActiveBtns) return ALL_BUTTONS;

    const activeBtns = Array.isArray(robot.Sections.main.ActiveBtns)
      ? robot.Sections.main.ActiveBtns
      : [];

    const activeStaticButtons = ALL_BUTTONS.filter((staticBtn) => {
      return activeBtns.some(
        (activeBtn) =>
          activeBtn &&
          typeof activeBtn.Name === "string" &&
          activeBtn.Name.toLowerCase() === staticBtn.toLowerCase()
      );
    });

    const newActiveButtons = activeBtns
      .filter(
        (activeBtn) =>
          activeBtn &&
          typeof activeBtn.Name === "string" &&
          !ALL_BUTTONS.some(
            (staticBtn) =>
              staticBtn.toLowerCase() === activeBtn.Name.toLowerCase()
          )
      )
      .map((activeBtn) => activeBtn.Name);

    return [...new Set([...activeStaticButtons, ...newActiveButtons])];
  };

  // message sender method mqtt
  const handleButtonClick = (topic, value) => {
    publishMessage(topic, value);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-color mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading robot data...</p>
        </div>
      </div>
    );

  if (!robot || Object.keys(robot).length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Robot not found.
      </div>
    );

  const showTrolley =
    robot?.isTrolley == 1 ||
    robot?.isTrolley === "true" ||
    robot?.isTrolley === true;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 sm:p-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER + IMAGE */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <img
              src={
                robot?.Image && robot.Image !== "Array"
                  ? `${UPLOADS_URL}/${robot.Image}?t=${Date.now()}`
                  : RobotImg
              }
              alt="Robot"
              className="h-40 w-40 object-cover rounded-xl border shadow-md"
            />

            <div>
              <h1 className="text-3xl font-bold text-main-color">
                {robot.RobotName || "Robot Details"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Project ID:{" "}
                <span className="font-mono">{robot.projectId || "-"}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate(-1)}
            className="bg-white border text-main-color"
          >
            Back
          </Button>
        </div>

        {/* TROLLEY SECTION */}
        {showTrolley && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-main-color">
                  Trolley Control
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage trolley controls, schedule and logs
                </p>
              </div>
              <Button
                onClick={() =>
                  navigate(`/homeDashboard/trolleySettings/${robot.id}`)
                }
                className="bg-main-color text-white h-10 self-start"
              >
                Settings
              </Button>
            </div>

            <TabsHeader
              tabs={[
                { id: "control", label: "Control" },
                { id: "notifications", label: "Notifications" },
                { id: "logs", label: "Logs" },
              ]}
              active={trolleyTab}
              onChange={setTrolleyTab}
              accent="main"
            />

            <div className="mt-5 space-y-6">
              {trolleyTab === "control" && (
                <TrolleyPanelDetails
                  robotId={id}
                  imgSrc="/assets/placeholder-trolley.jpg"
                  trolleyData={robot}
                  publish={handleButtonClick}
                  client={client}
                />
              )}
              {trolleyTab === "notifications" && (
                <NotificationsTab
                  projectId={robot.projectId || "-"}
                  robotId={robot.id || "-"}
                  sectionName="car"
                  publish={handleButtonClick}
                  client={client}
                />
              )}
              {trolleyTab === "logs" && (
                <LogsTab
                  projectId={robot.projectId || "-"}
                  robotId={robot.id || "-"}
                  sectionName="car"
                  publish={handleButtonClick}
                  client={client}
                />
              )}
            </div>
          </section>
        )}

        {/* SCHEDULE SETTINGS */}
        {showTrolley && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-main-color">
                  Schedule Settings
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure robot and trolley schedule
                </p>
              </div>
            </div>

            <ScheduleSettings
              schedule={robot.schedule || { days: [], hour: 8, minute: 0 }}
              setSchedule={(s) => setRobot((r) => ({ ...r, schedule: s }))}
              projectId={robot.projectId}
              publish={handleButtonClick}
              topic={robot.Sections?.car?.Topic_main}
            />
          </section>
        )}

        {/* ROBOT SECTION */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-main-color">Robot</h2>
              <p className="text-sm text-gray-500 mt-1">
                Robot settings, controls & logs
              </p>
            </div>
            <Button
              onClick={() =>
                navigate(`/homeDashboard/robotSettings/${robot.id}`)
              }
              className="bg-main-color text-white h-10 self-start"
            >
              Settings
            </Button>
          </div>

          <TabsHeader
            tabs={[
              { id: "control", label: "Control" },
              { id: "notifications", label: "Notifications" },
              { id: "logs", label: "Logs" },
            ]}
            active={robotTab}
            onChange={setRobotTab}
            accent="main"
          />

          <div className="mt-5 space-y-6">
            {robotTab === "control" && (
              <RobotMainPanelView
                robot={robot}
                setRobot={setRobot}
                allButtons={ALL_BUTTONS}
                publish={handleButtonClick}
                client={client}
              />
            )}
            {robotTab === "notifications" && (
              <NotificationsTab
                projectId={robot.projectId}
                robotId={robot.id}
                sectionName="main"
                publish={handleButtonClick}
                client={client}
              />
            )}
            {robotTab === "logs" && (
              <LogsTab
                projectId={robot.projectId}
                robotId={robot.id}
                sectionName="main"
                publish={handleButtonClick}
                client={client}
              />
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
