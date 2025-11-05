import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getData } from "@/services/getServices";
import { putData } from "@/services/putServices";
import { postButtons } from "@/services/postButtons";
import { putButtons } from "@/services/putButtons";
import { deleteData } from "@/services/deleteServices";
import Loading from "@/pages/Loading";

export default function EditRobot() {
  const navigate = useNavigate();
  const { id: robotId } = useParams();

  const [formData, setFormData] = useState({
    RobotName: "",
    Voltage: "",
    Cycles: "",
    Status: "Stopped",
    Image: null,
    imagePreview: null,
    ActiveBtns: [],
  });

  const [availableButtons, setAvailableButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalButtons, setOriginalButtons] = useState([]); // buttons from server (objects with ids)

  useEffect(() => {
    const fetchRobot = async () => {
      try {
        setLoading(true);
        const data = await getData(`/robots.php/${robotId}`);
        if (!data) throw new Error("No robot data");

        // decode ActiveBtns from robot if present
        let activeBtns = [];
        if (data.ActiveBtns) {
          if (typeof data.ActiveBtns === "string") {
            try {
              activeBtns = JSON.parse(data.ActiveBtns);
            } catch {
              activeBtns = Array.isArray(data.ActiveBtns) ? data.ActiveBtns : [];
            }
          } else if (Array.isArray(data.ActiveBtns)) {
            activeBtns = data.ActiveBtns;
          }
        }

        // set some static available buttons (you can fetch these from API if available)
        const allButtons = [
          { id: 1, name: "start" },
          { id: 2, name: "stop" },
          { id: 3, name: "forward" },
          { id: 4, name: "backward" },
          { id: 5, name: "scheduling" },
        ];

        setAvailableButtons(allButtons);
        setOriginalButtons(activeBtns);

        setFormData({
          RobotName: data.RobotName || "",
          Voltage: data.Voltage?.toString() || "",
          Cycles: data.Cycles?.toString() || "",
          Status: data.Status || "Stopped",
          Image: data.Image || null,
          imagePreview: data.Image
            ? `http://localhost/robots_web_apis/${data.Image}`
            : null,
          ActiveBtns: activeBtns,
        });
      } catch (err) {
        console.error(" Error fetching robot:", err);
        toast.error("Failed to load robot data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRobot();
  }, [robotId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "Image" && files?.[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        Image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleButtonSelect = (btn) => {
    setFormData((prev) => {
      const exists = prev.ActiveBtns.find((b) => (b.name || b.BtnName) === btn.name);
      const updated = exists
        ? prev.ActiveBtns.filter((b) => (b.name || b.BtnName) !== btn.name)
        : [...prev.ActiveBtns, btn];
      return { ...prev, ActiveBtns: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.RobotName || !formData.Voltage || !formData.Cycles) {
      toast.warning("Please fill all required fields!", {
        icon: <XCircle className="text-yellow-500" />,
      });
      setSubmitting(false);
      return;
    }

    try {
      // 1) Update robot basic info
      const payload = new FormData();
      payload.append("RobotName", formData.RobotName);
      payload.append("Voltage", formData.Voltage);
      payload.append("Cycles", formData.Cycles);
      payload.append("Status", formData.Status);
      payload.append("ActiveBtns", JSON.stringify(formData.ActiveBtns || []));

      if (formData.Image instanceof File) {
        payload.append("Image", formData.Image);
      } else if (typeof formData.Image === "string" && formData.Image) {
        payload.append("Image", formData.Image);
      }

      const res = await putData(`/robots.php/${robotId}`, payload);

      if (!res || (!res.success && !res.message?.toLowerCase().includes("success"))) {
        toast.error("Failed to update robot info.");
        setSubmitting(false);
        return;
      }

      // 2) Sync buttons with server safely
      // fetch current buttons from API and filter by RobotId
      const rawAllButtons = await getData("/buttons.php");
      const allButtonsArr = Array.isArray(rawAllButtons)
        ? rawAllButtons
        : rawAllButtons?.data || [];

      const currentButtons = allButtonsArr.filter(
        (b) => String(b.RobotId ?? b.robotId) === String(robotId)
      );

      // normalize helpers
      const nameOf = (obj) => (obj.BtnName ?? obj.name ?? "").toString().toLowerCase();

      const newBtns = (formData.ActiveBtns || []).map((b) => ({
        name: (b.name ?? b.BtnName ?? "").toString(),
        // keep any other props if present (Operation, Color)
        Operation: b.Operation,
        Color: b.Color,
      }));

      // determine deletions: currentButtons that are NOT in newBtns (by name)
      const toDelete = currentButtons.filter(
        (curr) => !newBtns.some((nb) => nb.name.toLowerCase() === nameOf(curr))
      );

      // determine additions: newBtns that are NOT in currentButtons (by name)
      const toAdd = newBtns.filter(
        (nb) => !currentButtons.some((curr) => nameOf(curr) === nb.name.toLowerCase())
      );

      // determine existing to update: intersection by name
      const toUpdate = newBtns.filter((nb) =>
        currentButtons.some((curr) => nameOf(curr) === nb.name.toLowerCase())
      );

      // 2.a Delete removed buttons (by using id or BtnID)
      for (const del of toDelete) {
        const delId = del.BtnID ?? del.id ?? del.BtnId ?? del.ID;
        if (delId != null) {
          try {
            await deleteData(`/buttons.php/${delId}`);
            console.log(`Deleted button id=${delId}`);
          } catch (err) {
            console.error("Error deleting button", del, err);
            // continue to next (don't abort all)
          }
        } else {
          console.warn("Cannot delete button (no id):", del);
        }
      }

      // 2.b Add new buttons (use postButtons to create them)
      if (toAdd.length > 0) {
        // postButtons expects array of { name }
        const addPayload = toAdd.map((b) => ({ name: b.name }));
        try {
          await postButtons(robotId, addPayload);
          console.log("Added buttons:", addPayload);
        } catch (err) {
          console.error("Error adding buttons:", err);
        }
      }

      // 2.c Update existing buttons (keep colors if present on server)
      if (toUpdate.length > 0) {
        try {
          // call putButtons with toUpdate (it will preserve existing color for matches)
          await putButtons(robotId, toUpdate);
          console.log("Updated existing buttons via putButtons");
        } catch (err) {
          console.error("Error updating existing buttons:", err);
        }
      }

      toast.success(" Robot and buttons updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error(" Update error:", err);
      toast.error("Error while updating robot.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 sm:p-10">
      <div className="max-w-5xl w-full mx-auto mb-6 flex justify-start">
        <Button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full mx-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col gap-10"
      >
        <h1 className="text-3xl font-bold text-main-color text-center">
          Edit Robot {formData.RobotName ? `– ${formData.RobotName}` : ""}
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Image */}
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-main-color transition relative cursor-pointer">
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="w-full h-56 object-cover rounded-xl shadow-md mb-4"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <Upload size={40} className="mx-auto mb-3" />
                <p>Upload robot image</p>
                <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
              </div>
            )}
            <input
              id="Image"
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Robot Name *
              </label>
              <Input
                type="text"
                name="RobotName"
                value={formData.RobotName}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Voltage *
              </label>
              <Input
                type="number"
                name="Voltage"
                value={formData.Voltage}
                onChange={handleChange}
                required
                step="0.1"
                className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Cycles *
              </label>
              <Input
                type="number"
                name="Cycles"
                value={formData.Cycles}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Status
              </label>
              <select
                name="Status"
                value={formData.Status}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-main-color cursor-pointer"
              >
                <option value="Running">Running</option>
                <option value="Stopped">Stopped</option>
              </select>
            </div>

            {/* Buttons */}
            <div>
              <label className="block text-gray-700 font-semibold mb-4">
                Active Buttons
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({formData.ActiveBtns.length} selected)
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                {availableButtons.map((btn) => {
                  const isSelected = formData.ActiveBtns.some(
                    (b) => (b.name ?? b.BtnName) === btn.name
                  );
                  return (
                    <Button
                      type="button"
                      key={btn.id}
                      onClick={() => handleButtonSelect(btn)}
                      className={`border rounded-xl px-5 py-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-main-color text-white border-main-color shadow-md"
                          : "bg-white text-main-color border-main-color hover:bg-main-color hover:text-white"
                      }`}
                    >
                      {btn.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Save */}
            <div className="pt-4 flex md:justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="cursor-pointer flex items-center gap-2 bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium transition-all"
              >
                <Save size={22} />
                {submitting ? "Saving..." : "Update Robot"}
              </Button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
