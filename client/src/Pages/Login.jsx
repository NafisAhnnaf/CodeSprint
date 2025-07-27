import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Request from "../composables/Request";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = async () => {
    if (formData.email === "" || formData.password === "") {
      toast.warning("Email or Password cannot be empty", {
        toastId: "Empty-String",
      });
      setError("Email or Password field is empty");
      return;
    }
    try {
      const res = await Request.post("/api/auth/login", formData);
      login(res.token);
      console.log(res);
      toast.success("Login Successful!", {
        toastId: "User-Authorized",
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="p-5 h-[75vh] flex flex-col justify-center items-center">
      <div className="bg-white flex flex-col items-center p-5 max-w-3xl rounded-lg text-black space-y-4">
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded-lg border border-gray-500"
          required
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value.trim() });
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded-lg border border-gray-500"
          required
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
          }}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          color="primary"
          variant="contained"
          label={"Login"}
          onClick={handleLogin}
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
