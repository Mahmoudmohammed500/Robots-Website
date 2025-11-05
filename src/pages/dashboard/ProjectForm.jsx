import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Save, CheckCircle2, XCircle } from "lucide-react";
import { postData } from "@/services/postServices";
import { putData } from "@/services/putServices";
import { getData } from "@/services/getServices";
import { toast } from "sonner";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [formData, setFormData] = useState({
    ProjectName: "",
    Location: "",
    Description: "",
    Image: null,
    imagePreview: null,
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (editing) {
        try {
          const data = await getData(`/projects.php?id=${id}`);
          if (data) {
            const project = Array.isArray(data) ? data[0] : data;
            setFormData({
              ProjectName: project.ProjectName || "",
              Location: project.Location || "",
              Description: project.Description || "",
              Image: project.Image || null,
              imagePreview: project.Image
                ? `${import.meta.env.VITE_UPLOADS_URL}/${project.Image}`
                : null,
            });
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast.error("Failed to load project data");
        }
      }
    };
    fetchProject();
  }, [editing, id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "Image" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        Image: file,
        imagePreview: previewUrl,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.ProjectName || !formData.Location || !formData.Description) {
        toast.warning("Please fill all required fields!", {
          icon: <XCircle className="text-yellow-500" />,
        });
        return;
      }

      const imagePath = formData.Image
        ? `uploads/${formData.Image.name || formData.Image}`
        : null;

      const dataToSend = {
        ProjectName: formData.ProjectName,
        Location: formData.Location,
        Description: formData.Description,
        Image: imagePath,
      };

      if (editing) {
        dataToSend.projectId = id;
        dataToSend.id = id;

        const response = await putData(`/projects.php/${id}`, dataToSend);

        if (response?.message?.toLowerCase().includes("success")) {
          toast.success("Project updated successfully!", {
            icon: <CheckCircle2 className="text-green-500" />,
            description: "Project details have been updated.",
          });
        } else {
          toast.error(response?.message || "Failed to update project");
        }
      } else {
        await postData("/projects.php", dataToSend);
        toast.success("Project added successfully!", {
          icon: <CheckCircle2 className="text-green-500" />,
          description: "New project has been added.",
        });
      }

      setTimeout(() => navigate("/homeDashboard"), 1500);
    } catch (error) {
      console.error("❌ Error saving project:", error);
      toast.error("Something went wrong!", {
        icon: <XCircle className="text-red-500" />,
        description: "Please check your connection or server logs.",
      });
    }
  };

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

=      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="max-w-5xl w-full mx-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col gap-10"
      >
        <h1 className="text-3xl font-bold text-main-color text-center">
          {editing
            ? `Edit Project ${formData.ProjectName || ""}`
            : "Add New Project"}
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
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
                <p>Upload project image</p>
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

          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Project Name
              </label>
              <Input
                type="text"
                name="ProjectName"
                value={formData.ProjectName}
                onChange={handleChange}
                placeholder="Enter project name"
                required
                className="cursor-pointer border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Location
              </label>
              <Input
                type="text"
                name="Location"
                value={formData.Location}
                onChange={handleChange}
                placeholder="Enter location"
                required
                className="cursor-pointer border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <Textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="Describe the project..."
                rows={5}
                required
                className="cursor-pointer border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
              />
            </div>

            <div className="pt-4 flex md:justify-end">
              <Button
                type="submit"
                className="cursor-pointer flex items-center gap-2 bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium transition-all"
              >
                <Save size={22} />
                {editing ? "Save Changes" : "Add Project"}
              </Button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
