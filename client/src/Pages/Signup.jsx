import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Request from "../composables/Request";
const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      await Request.post("/api/auth/register", form);
      navigate("/login"); // redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="h-[75vh] w-full flex flex-col justify-center items-center">
      <div className="p-6 max-w-2xl text-black flex flex-col justify-center items-center bg-white rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Staff Signup</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-2 p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-2 p-2 border rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSignup}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
