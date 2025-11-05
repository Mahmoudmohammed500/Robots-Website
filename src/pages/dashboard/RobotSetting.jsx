import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getData } from "@/services/getServices";
import { postData } from "@/services/postServices";

export default function RobotSettings() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [robot, setRobot] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const ALL_NAMES = ["start", "stop", "forward", "backward", "scheduling"];

  const defaultButtonColors = {
    STOP: "#ef4444",
    START: "#22c55e",
    BACKWARD: "#facc15",
    SCHEDULING: "#0ea5e9",
    FORWARD: "#6366f1",
  };

  const fetchRobotData = async () => {
    try {
      setLoading(true);
      const robotData = await getData(`/robots.php/${id}`);
      setRobot(robotData);

      const rawButtons = await getData(`/buttons.php`);
      const arr = Array.isArray(rawButtons)
        ? rawButtons
        : rawButtons?.data || [];

      const robotButtons = arr
        .filter((b) => String(b.RobotId) === String(id))
        .map((b) => ({
          id: b.BtnID ?? b.id,
          name: (b.BtnName ?? b.name ?? "").toString(),
          color: b.Color ?? null,
          operation: b.Operation ?? null,
          RobotId: b.RobotId ?? b.robotId ?? null,
        }));

      setButtons(robotButtons);
    } catch (err) {
      console.error(" Failed to fetch robot data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobotData();

    const updated = sessionStorage.getItem("robotUpdated");
    if (updated === "true") {
      fetchRobotData();
      sessionStorage.removeItem("robotUpdated");
    }
  }, [id]);

  const refreshButtons = async () => {
    try {
      const rawButtons = await getData(`/buttons.php`);
      const arr = Array.isArray(rawButtons)
        ? rawButtons
        : rawButtons?.data || [];

      const robotButtons = arr
        .filter((b) => String(b.RobotId) === String(id))
        .map((b) => ({
          id: b.BtnID ?? b.id,
          name: (b.BtnName ?? b.name ?? "").toString(),
          color: b.Color ?? null,
          operation: b.Operation ?? null,
          RobotId: b.RobotId ?? b.robotId ?? null,
        }));

      setButtons(robotButtons);
    } catch (err) {
      console.error(" Failed to refresh buttons:", err);
    }
  };

  const activeNames = buttons.map((b) => b.name.toLowerCase());
  const availableNames = ALL_NAMES.filter((n) => !activeNames.includes(n));

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color"
        >
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        {robot?.RobotName} Settings
      </h1>

      {/*  Active Buttons */}
      <div className="bg-white p-8 rounded-3xl shadow-lg mb-10">
        <h2 className="text-2xl text-green-700 text-center mb-6">
          Active Buttons
        </h2>

        {buttons.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-5">
            {buttons.map((btn) => {
              const color =
                btn.color ||
                defaultButtonColors[btn.name?.toUpperCase()] ||
                "#6b7280";
              return (
                <Button
                  key={btn.id}
                  onClick={() =>
                    navigate(
                      `/homeDashboard/robotSettings/${id}/button/${btn.id}`
                    )
                  }
                  style={{ backgroundColor: color, color: "#fff" }}
                  className="px-8 py-4 rounded-2xl text-lg font-semibold shadow hover:shadow-lg transition"
                >
                  {btn.name}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No active buttons</p>
        )}
      </div>

      {/*  Available Buttons */}
      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl text-blue-700 text-center mb-6">
          Available Buttons
        </h2>

        {availableNames.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-5">
            {availableNames.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-3 bg-gray-50 border border-gray-200 rounded-3xl p-5 w-40 shadow-sm hover:shadow-md transition"
              >
                <Button
  onClick={() =>
    navigate(
      `/homeDashboard/robotSettings/${id}/button/new?name=${name}`
    )
  }
  disabled={adding}
  className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color rounded-xl px-5 py-2 transition-all"
>
  <PlusCircle size={16} />
  {adding ? "Adding..." : "Add"}
</Button>

                <p className="capitalize text-gray-700">{name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No available buttons</p>
        )}
      </div>
    </div>
  );
}
