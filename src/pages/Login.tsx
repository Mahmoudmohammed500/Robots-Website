import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // form submit handler
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const validEmail = "admin@example.com";
    const validPassword = "admin@example.com";

    // authentication check result
    if (email === validEmail && password === validPassword) {
      login();
      toast.success(" تم تسجيل الدخول بنجاح");
      navigate("/");
    } else {
      toast.error(" البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  return ( 
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-3/4 md:w-1/2 lg:w-1/3 shadow-lg border bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-main-color">
            مرحبًا بعودتك
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">سجّل الدخول إلى حسابك</p>
        </CardHeader>

        <CardContent className={""}>
          <form onSubmit={handleSubmit} className="space-y-5 text-right">
            <div className="flex flex-col space-y-2">

              <Label htmlFor="email" className="font-medium text-gray-700">
                البريد الإلكتروني
              </Label>
              {/* email address */}
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
                className="bg-gray-50"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password" className="font-medium text-gray-700">
                كلمة المرور
              </Label>
              {/* password */}
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
                className="bg-gray-50"
              />
            </div>
            {/* login btn */}

            <Button
              size="default"
              variant="default"
              type="submit"
              className="w-full bg-black my-5 text-white hover:bg-main-color transition-colors duration-200"
            >
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
