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
import { Mail, Lock } from "lucide-react";
import LogoImg from "../assets/logo omega-2022.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const validEmail = "admin@example.com";
    const validPassword = "admin@example.com";

    //simulate daployment dalay
    setTimeout(() => {
      if (email === validEmail && password === validPassword) {
        login();
        toast.success("Welcome back");
        navigate("/home", { replace: true });
      } else {
        toast.error("Invalid email or password");
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main-color/20 via-white to-second-color/20 relative overflow-hidden">
      {/* animated bg  */}
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

      {/* form */}
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
              className="h-16 mx-auto object-contain "
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
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
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
                             bg-linear-to-r from-main-color to-second-color
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
