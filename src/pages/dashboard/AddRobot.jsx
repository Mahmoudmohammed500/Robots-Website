import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

export default function RobotForm({ robots = [], onSubmit }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);
  const robotToEdit = robots.find((r) => r.id === parseInt(id));

  const [formData, setFormData] = useState(
    robotToEdit || {
      name: "",
      project: "",
      description: "",
      image: null,
      imagePreview: null,
    }
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file,
        imagePreview: previewUrl,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 sm:p-10">
      <div className="max-w-5xl w-full mx-auto mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color 
          rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        {editing ? "Edit Robot" : "Add New Robot"}
      </h1>

      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="max-w-5xl w-full mx-auto bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row gap-10"
      >
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-main-color transition relative cursor-pointer">
          {formData.imagePreview ? (
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="w-full h-56 object-cover rounded-xl shadow-md mb-4"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <p>Upload robot image</p>
            </div>
          )}
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Robot Name
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter robot name"
              required
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Project Name
            </label>
            <Input
              type="text"
              name="project"
              value={formData.project}
              onChange={handleChange}
              placeholder="Enter related project name"
              required
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the robot..."
              rows={5}
              required
              className="border-gray-300 focus:ring-2 focus:ring-main-color rounded-xl"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="flex items-center gap-2 bg-second-color text-white border border-second-color hover:bg-white hover:text-second-color 
              px-6 py-3 rounded-2xl shadow-md hover:shadow-lg text-lg font-medium transition-all cursor-pointer"
            >
              <Save size={22} />
              {editing ? "Save Changes" : "Add Robot"}
            </Button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
