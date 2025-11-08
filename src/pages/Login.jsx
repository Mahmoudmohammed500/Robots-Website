import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import LogoImg from "../assets/logo omega-2022.png";
import { postData } from "@/services/postServices";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = "admin@omega.com";
  const ADMIN_PASSWORD = "admin@omega.com";
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        login();
        toast.success("Welcome back, Admin!");
        navigate("/homeDashboard", { replace: true });
      } else {
        const data = await postData(`${BASE_URL}/login`, {
          username,
          password,
        });

        // تعديل هنا: نتحقق من وجود message "Login successful" ووجود user
        if (data?.message === "Login successful" && data?.user) {
          login();
          toast.success(`Welcome back, ${username}!`);
          navigate("/home", { replace: true });
        } else {
          toast.error("Invalid username or password");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main-color/20 via-white to-second-color/20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-main-color/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-second-color/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 9, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>

      {/* Form */}
      <motion.div
        className="relative w-full max-w-md p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Card className="shadow-2xl border border-gray-100 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-3">
            <motion.img
              src={LogoImg}
              alt="Omega Logo"
              className="h-16 mx-auto object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            />
            <CardTitle className="text-3xl font-extrabold text-main-color tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              Sign in to access your Omega Robotics
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-9 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-main-color focus:border-main-color rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-main-color focus:border-main-color rounded-xl"
                  />
                </div>
              </div>

              {/* Login Button */}
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 mt-4 text-lg font-semibold 
                             border-2 border-main-color text-white
                             bg-linear-to-r bg-main-color
                             rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10">
                    {loading ? "Logging in..." : "Sign In"}
                  </span>
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
