// File: src/pages/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../services/api";
import Logo from "../components/Logo";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser({ email, password });
    alert("Registered successfully. Please login.");
  };

  const GoLogin = async (e) =>{

    navigate("/login");
    
  }

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-gray-700 min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <Logo />
        <h2 className="text-3xl font-bold text-center text-zinc-800">
          Register
        </h2>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-style"
            type="email"
            placeholder="Email"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-style"
            type="password"
            placeholder="Password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-zinc-800 text-white py-3 rounded-lg font-semibold hover:bg-zinc-900 transition cursor-pointer"
        >
          Register
        </button>
        <button
          type="button"
          onClick={GoLogin}
          className="w-full text-gray-600 cursor-pointer"
        >
          Already have Account ?
        </button>
      </form>
    </div>
  );
}

export default Register;
