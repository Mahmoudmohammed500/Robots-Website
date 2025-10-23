import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ProductCard from "../components/RobotCard";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import RobotImg from "../assets/Robot1.jpeg";

export default function Robots() {
  const navigate = useNavigate();
  const projectNumber = 1;

  // dummy robots data
  const robots = [
    { id: 1, name: "Omega Robot X1", image: RobotImg },
    { id: 2, name: "Omega Robot X2", image: RobotImg },
    { id: 3, name: "Omega Robot X3", image: RobotImg },
    { id: 4, name: "Omega Robot X4", image: RobotImg },
    { id: 5, name: "Omega Robot X5", image: RobotImg },
    { id: 6, name: "Omega Robot X6", image: RobotImg },
    { id: 7, name: "Omega Robot X7", image: RobotImg },
  ];

  // navigate to robot details
  const handleViewDetails = (robotId) => {
    navigate(`/robots/${robotId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="container mx-auto px-6 pt-36 pb-24 ">
        <motion.h2
          className="text-4xl font-bold text-gray-900 mb-12 text-center "
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Cleaning Robots
        </motion.h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {robots.map((robot, index) => (
            <motion.div
              key={robot.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <ProductCard
                image={robot.image}
                name={`${robot.name}-${projectNumber}`}
                description="Advanced autonomous solar panel cleaning robot for maximum efficiency."
                onView={() => handleViewDetails(robot.id)}
              />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}