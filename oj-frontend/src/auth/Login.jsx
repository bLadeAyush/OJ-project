import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import api from "../api/axios";
import "./login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("users/login/", form);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      toast.success("Login successful");
      navigate("/profile");
    } catch (err) {
      toast.error("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const rows = 10;
  const hexagonsPerRow = 16;
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
      <div className="fixed inset-0 flex justify-center items-center z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 bottom-0 z-10" />

        <motion.form
          onSubmit={handleSubmit}
          className="relative z-20 bg-white p-6 sm:p-8 md:p-10 rounded-xl text-slate-600 w-[90%] max-w-sm pointer-events-auto"
          initial={{ opacity: 0.2, y: 50 }}
          transition={{ duration: 0.3 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h1 className="text-center text-xl md:text-2xl font-semibold text-neutral-800">
            Sign In
          </h1>
          <p className="text-xs md:text-sm text-center text-gray-500 mb-4">
            Welcome back! Please sign in
          </p>

          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
            <img src={assets.email_icon} alt="" />
            <input
              name="username"
              onChange={handleChange}
              value={form.username}
              className="outline-none text-sm w-full"
              type="text"
              placeholder="Username"
              required
            />
          </div>

          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
            <img src={assets.lock_icon} alt="" />
            <input
              name="password"
              type="password"
              onChange={handleChange}
              value={form.password}
              className="outline-none text-sm w-full"
              placeholder="Password"
              required
            />
          </div>

          <button
            disabled={loading}
            className={`${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } w-full text-white py-2 rounded-full transition duration-300 mt-4`}
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>

          <p className="mt-5 text-center">
            Don’t have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </p>
        </motion.form>
      </div>
    </>
  );
}
