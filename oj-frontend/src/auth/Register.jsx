import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("users/register/", form);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error during registration.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <input
        name="username"
        onChange={handleChange}
        placeholder="Username"
        className="w-full p-2 border"
      />
      <input
        name="email"
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border"
      />
      <input
        name="password"
        type="password"
        onChange={handleChange}
        placeholder="Password"
        className="w-full p-2 border"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Register
      </button>
    </form>
  );
}
