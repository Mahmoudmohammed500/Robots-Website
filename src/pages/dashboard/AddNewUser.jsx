import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="w-full max-w-2xl relative">
        <Button
          onClick={() => navigate(-1)}
          className="absolute -top-10 left-0 flex items-center gap-2 bg-transparent text-main-color border border-main-color hover:bg-main-color/10 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <Card className="shadow-xl border border-gray-100 rounded-2xl p-6 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center">
              Add New User
            </CardTitle>
            <p className="text-center text-gray-500 text-sm mt-1">
              Fill in the required information below
            </p>
          </CardHeader>

          <CardContent>
            <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col space-y-2 sm:col-span-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  className="h-12 border-gray-300 focus:border-main-color focus:ring-main-color rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="h-12 border-gray-300 focus:border-main-color focus:ring-main-color rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="h-12 border-gray-300 focus:border-main-color focus:ring-main-color rounded-xl"
                />
              </div>

              {/* Project Name */}
              <div className="flex flex-col space-y-2 sm:col-span-2">
                <Label htmlFor="project" className="text-gray-700 font-medium">
                  Project Name
                </Label>
                <Input
                  id="project"
                  placeholder="Enter project name"
                  className="h-12 border-gray-300 focus:border-main-color focus:ring-main-color rounded-xl"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col space-y-2 sm:col-span-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="h-12 border-gray-300 focus:border-main-color focus:ring-main-color rounded-xl"
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 flex justify-center pt-4">
                <Button className="w-full sm:w-1/2 h-12 bg-main-color text-white text-lg rounded-xl hover:bg-main-color/90 transition-all cursor-pointer">
                  Add User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
