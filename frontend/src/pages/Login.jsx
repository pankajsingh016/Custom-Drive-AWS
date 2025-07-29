// src/pages/Login.jsx
import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email);
    console.log(password);

    try {
      const res = await loginUser({ email, password });
      const { user } = res.data.data; // Destructure user from res.data.data
      login(user); // Call AuthContext's login function
      navigate("/files");
    } catch (err) {
      console.log("Login Failed:", err);
      alert("Invalid Credentials. Try again.");
    }
  };

  const GoRegister = async (e)=>{
    try{
      navigate("/register");
    } catch(err){
      console.log("Register Route Failde",err);
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-zinc-700 min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <Logo />
        <h2 className="text-3xl font-bold text-center text-zinc-800">Login</h2>

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
          className="w-full hover:bg-blue-500 text-white py-3 rounded-lg font-semibold bg-zinc-900 transition cursor-pointer"
        >
          Login
        </button>
          <button
          onClick={GoRegister}
          type="button"
          className="w-full hover:bg-blue-500 text-white py-3 rounded-lg font-semibold bg-zinc-900 transition cursor-pointer"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;
