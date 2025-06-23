import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api
      .get("profile/")
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error(err);
        alert("Unauthorized or error loading profile.");
      });
  }, []);

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };
  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border">
      <h2 className="text-xl font-bold mb-4">Welcome, {profile.username}</h2>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>Bio:</strong> {profile.bio || "Not set"}
      </p>
      <p>
        <strong>Streak:</strong> {profile.streak}
      </p>
      <p>
        <strong>Badges:</strong> {profile.badges.join(", ")}
      </p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Logout
      </button>
    </div>
  );
}
