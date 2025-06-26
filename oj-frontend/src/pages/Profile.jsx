import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");

  useEffect(() => {
    api.get("users/profile/").then((res) => {
      setProfile(res.data);
      setBio(res.data.bio || "");
    });
  }, []);

  const handleUpdate = () => {
    api
      .put("users/profile/", {
        bio: bio,
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        alert("Error updating profile.");
        console.log(err);
      });
  };

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
        <strong>Bio:</strong> {profile.bio || "Not set"}
      </p>
      <textarea
        className="w-full p-2 border mt-2"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
      >
        Update Bio
      </button>
      <div className="mt-4 space-y-2">
        <p>
          <strong>Streak:</strong> {profile.streak}
        </p>
        <p>
          <strong>Badges:</strong>{" "}
          {profile.badges?.length ? profile.badges.join(", ") : "No badges yet"}
        </p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(profile.joined_at).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Logout
      </button>
    </div>
  );
}
