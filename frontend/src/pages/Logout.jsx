import React from "react";
import { logoutUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white font-bold"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
