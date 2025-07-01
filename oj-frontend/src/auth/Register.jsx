import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { assets } from "../assets/assets";
import "./login.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const rows = 10;
  const hexagonsPerRow = 16;
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("users/register/", form);
      if (res.data?.token) {
        toast.success("🎉 Registration successful!");
        localStorage.setItem("access", res.data.token);
        navigate("/profile");
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  return (
    <>
      <div className="container">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="row">
            {Array.from({
              length: rowIndex % 2 === 0 ? hexagonsPerRow : hexagonsPerRow - 1,
            }).map((_, hexIndex) => (
              <div key={`hex-${rowIndex}-${hexIndex}`} className="hexagon" />
            ))}
          </div>
        ))}
      </div>
      <div className="fixed top-0 right-0 left-0 bottom-0  flex justify-center items-center z-50 pointer-events-none">
        <motion.form
          onSubmit={handleSubmit}
          className="relative bg-white p-10 rounded-xl text-slate-600 w-[90%] max-w-md pointer-events-auto"
          initial={{ opacity: 0.2, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-center text-2xl font-semibold text-neutral-800">
            SignUp
          </h1>
          <p className="text-sm text-center text-gray-500 mb-4">
            Join us to explore more!
          </p>

          {/* Full Name */}
          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
            <img src={assets.user_icon} alt="user" width={16} />
            <input
              name="username"
              onChange={handleChange}
              value={form.username}
              placeholder="Full Name"
              type="text"
              required
              className="outline-none text-sm w-full"
            />
          </div>
          <p className="p-2 text-sm">
            Required. 150 characters or fewer. Letters, digits and @/./+/-/_
            only.
          </p>
          {/* Email */}
          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
            <img src={assets.email_icon} alt="email" width={16} />
            <input
              name="email"
              onChange={handleChange}
              value={form.email}
              placeholder="Email"
              type="email"
              required
              className="outline-none text-sm w-full"
            />
          </div>

          {/* Password */}
          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
            <img src={assets.lock_icon} alt="lock" width={16} />
            <input
              name="password"
              onChange={handleChange}
              value={form.password}
              placeholder="Password"
              type="password"
              required
              className="outline-none text-sm w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-full mt-6 font-medium transition duration-300 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Please wait..." : "Create Account"}
          </button>

          <p className="mt-5 text-center text-sm">
            Already have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              Sign In
            </span>
          </p>
        </motion.form>
      </div>
    </>
  );
};

export default Register;
