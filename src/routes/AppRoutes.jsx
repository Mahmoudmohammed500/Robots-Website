import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Robots from "../pages/Robots";
import RobotDetails from "../pages/RobotDetails";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DashboardRoutes from "../pages/dashboard/DashboardRoutes"; 

let Loading, NotFound;

try {
  Loading = require("../pages/Loading").default;
  NotFound = require("../pages/NotFound").default;
} catch (error) {
  Loading = () => (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );
  NotFound = () => (
    <div className="min-h-screen flex items-center justify-center">
      Page Not Found
    </div>
  );
}

// Layout عادي لموقع المستخدم
function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}

// Layout    -  Navbar/Footer
function SimpleLayout({ children }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <SimpleLayout>
              <Login />
            </SimpleLayout>
          }
        />
        <Route
          path="/loading"
          element={
            <SimpleLayout>
              <Loading />
            </SimpleLayout>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/home"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/robots"
        element={
          <Layout>
            <Robots />
          </Layout>
        }
      />
      <Route
        path="/robots/:id"
        element={
          <Layout>
            <RobotDetails />
          </Layout>
        }
      />

      <Route path="/homeDashboard/*" element={<DashboardRoutes />} />

      <Route
        path="/loading"
        element={
          <SimpleLayout>
            <Loading />
          </SimpleLayout>
        }
      />
      <Route
        path="*"
        element={
          <SimpleLayout>
            <NotFound />
          </SimpleLayout>
        }
      />
    </Routes>
  );
}
