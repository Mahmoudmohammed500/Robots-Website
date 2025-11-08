import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getData } from "@/services/getServices";
import { putData } from "@/services/putServices";
import Loading from "@/pages/Loading";

const ALL_BUTTONS = ["Forward", "Backward", "Stop", "Left", "Right"];

export default function EditRobot() {
  const navigate = useNavigate();
  const { id: robotId } = useParams();

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    RobotName: "",
    Image: null,
    imagePreview: null,
    Status: "Stopped",
  });
  const [sectionData, setSectionData] = useState({
    Voltage: "",
    Cycles: "",
    ActiveBtns: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch robot data by ID
  useEffect(() => {
    const fetchRobot = async () => {
      try {
        setLoading(true);
        const data = await getData(`/robots.php/${robotId}`);
        if (!data) throw new Error("No robot data found");

        setOriginalData(data);

        const section = data.Sections?.main || {};

        setFormData({
          RobotName: data.RobotName || "",
          Status: section.Status || "Stopped",
          Image: data.Image || null,
          imagePreview: data.Image
            ? `http://localhost/robots_web_apis/${data.Image}?t=${Date.now()}`
            : null,
        });

        let activeBtns = [];
        if (Array.isArray(section.ActiveBtns))
          activeBtns = section.ActiveBtns.map((b) => b.Name);

        setSectionData({
          Voltage: section.Voltage?.toString() || "",
          Cycles: section.Cycles?.toString() || "",
          ActiveBtns: activeBtns,
        });
      } catch (err) {
        console.error("Error fetching robot:", err);
        toast.error("Failed to load robot data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRobot();
  }, [robotId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "Image" && files?.[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        Image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else if (name === "Voltage" || name === "Cycles") {
      setSectionData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Toggle button selection
  const toggleButton = (btnName) => {
    setSectionData((prev) => {
      const exists = prev.ActiveBtns.includes(btnName);
      return {
        ...prev,
        ActiveBtns: exists
          ? prev.ActiveBtns.filter((b) => b !== btnName)
          : [...prev.ActiveBtns, btnName],
      };
    });
  };

  // Handle save - FIXED TO INCLUDE ALL DATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.RobotName || !sectionData.Voltage || !sectionData.Cycles) {
      toast.warning("Please fill all required fields!", {
        icon: <XCircle className="text-yellow-500" />,
      });
      setSubmitting(false);
      return;
    }

    try {
      if (!originalData) throw new Error("Original data not loaded");

      // ✅ بناء البيانات المحدثة مع الحفاظ على كل الحقول الأصلية
      const updatedData = {
        // الحفاظ على كل البيانات الأصلية
        ...originalData,
        
        // تحديث الحقول التي تم تعديلها
        id: parseInt(robotId), // تأكد أن الـ ID رقم صحيح
        RobotName: formData.RobotName,
        // الحفاظ على الـ Image القديم إذا لم يتم تغييره
        Image: formData.Image instanceof File ? formData.Image : originalData.Image,
        
        // تحديث الـ Sections مع الحفاظ على الهيكل الكامل
        Sections: {
          ...originalData.Sections, // الحفاظ على كل الـ sections الأخرى
          main: {
            ...originalData.Sections?.main, // الحفاظ على كل بيانات الـ main الأصلية
            Voltage: Number(sectionData.Voltage),
            Cycles: Number(sectionData.Cycles),
            Status: formData.Status,
            ActiveBtns: sectionData.ActiveBtns.map((name, idx) => ({
              Name: name,
              id: (idx + 1).toString(), // جعله string كما في البيانات الأصلية
            })),
            // الحفاظ على الحقول الأخرى مثل Topic_subscribe و Topic_main
            Topic_subscribe: originalData.Sections?.main?.Topic_subscribe || "robot/main/in",
            Topic_main: originalData.Sections?.main?.Topic_main || "robot/main/out",
          },
        },
      };

      console.log("Data being sent:", updatedData);

      const payload = new FormData();
      
      // ✅ إرسال البيانات كاملة
      payload.append("data", JSON.stringify(updatedData));

      // ✅ إذا كان هناك صورة جديدة، أضفها
      if (formData.Image instanceof File) {
        payload.append("image", formData.Image);
      }

      const res = await putData(`/robots.php/${robotId}`, payload);

      if (!res || (!res.success && !res.message?.toLowerCase().includes("success"))) {
        toast.error("Failed to update robot info.");
        setSubmitting(false);
        return;
      }

      // Update local state immediately
      setOriginalData(updatedData);

      toast.success("Robot updated successfully!");

      // العودة للصفحة السابقة مع تحديث البيانات
      navigate(-1, { state: { shouldRefresh: true } });

    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error while updating robot.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 sm:p-10">
      {/* Back Button */}
      <div className="max-w-5xl w-full mx-auto mb-6 flex justify-start">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      {/* Form */}
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
          {/* Image Section */}
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
                value={sectionData.Voltage}
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
                value={sectionData.Cycles}
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

            {/* Active Buttons */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Active Buttons
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_BUTTONS.map((btn) => {
                  const isActive = sectionData.ActiveBtns.includes(btn);
                  return (
                    <Button
                      key={btn}
                      type="button"
                      onClick={() => toggleButton(btn)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                        isActive
                          ? "bg-main-color text-white border-main-color"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-main-color hover:text-white"
                      }`}
                    >
                      {btn} {isActive && "✓"}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex md:justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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