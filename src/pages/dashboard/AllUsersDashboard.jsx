import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import imgRobot from "../../assets/Robot1.jpeg";

const initialUsers = [
  {
    id: 1,
    name: "Omar Khaled",
    email: "omar.khaled@example.com",
    password: "omar123",
    project: "Autonomous Navigation System",
    phone: "+20 100 556 7890",
    avatar: imgRobot,
  },
  {
    id: 2,
    name: "Sara Mahmoud",
    email: "sara.mh@example.com",
    password: "sara456",
    project: "Industrial Robot Controller",
    phone: "+971 52 445 9982",
    avatar: imgRobot,
  },
  {
    id: 3,
    name: "Ahmed Samir",
    email: "ahmed.samir@example.com",
    password: "ahmed789",
    project: "Drone Fleet Management",
    phone: "+49 151 223 4456",
    avatar: imgRobot,
  },
];

function ConfirmDeleteModal({ user, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {user && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border border-gray-200"
          >
            <XCircle
              size={48}
              className="mx-auto text-red-500 mb-4 animate-pulse"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-main-color">{user.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={onCancel}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-6 rounded-xl transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onConfirm(user.id)}
                className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 px-6 rounded-xl transition-all"
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AllUsers({ users, onDeleteClick, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Users</h1>
        <Button
          onClick={() => navigate("/homeDashboard/addUser")}
          className="flex items-center gap-2 bg-main-color text-white hover:bg-white hover:text-main-color border border-main-color transition-all duration-300 rounded-xl"
        >
          <UserPlus size={18} />
          Add User
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-main-color shadow-md"
            />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{user.email}</p>

            <div className="text-left w-full border-t border-gray-100 pt-3 text-sm text-gray-600 space-y-1">
              <p>
                <strong className="text-main-color">Project:</strong> {user.project}
              </p>
              <p>
                <strong className="text-main-color">Password:</strong> {user.password}
              </p>
              <p>
                <strong className="text-main-color">Phone:</strong> {user.phone}
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                onClick={() => navigate("/homeDashboard/addUser")}
                className="flex items-center gap-2 bg-second-color text-white hover:bg-white hover:text-second-color border border-second-color rounded-lg px-4 py-2"
              >
                <Edit3 size={16} />
                Edit
              </Button>
              <Button
                onClick={() => onDeleteClick(user)}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 rounded-lg px-4 py-2"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AddUser() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Add New User</h1>
      <p className="text-gray-500">(Here will be the form to create a new user...)</p>
    </div>
  );
}

export default function UsersDashboard() {
  const [users, setUsers] = useState(initialUsers);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setUserToDelete(null);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const handleEditUser = (userId) => {
    console.log("Edit user", userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <div className="flex-1 flex flex-col min-h-screen overflow-auto relative">
        <Routes>
          <Route
            path="/"
            element={
              <AllUsers
                users={users}
                onDeleteClick={handleOpenDeleteModal}
                onEdit={handleEditUser}
              />
            }
          />
          <Route path="add" element={<AddUser />} />
        </Routes>

        <ConfirmDeleteModal
          user={userToDelete}
          onConfirm={handleDeleteUser}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
}
