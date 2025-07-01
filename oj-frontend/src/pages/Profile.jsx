import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import "../index.css";
import Navbar from "../components/Navbar.jsx";
export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);

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
        setEditing(false);
      })
      .catch((err) => {
        alert("Error updating profile.");
        console.log(err);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  if (!profile)
    return <p className="text-center mt-10 text-white">Loading profile...</p>;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Navbar />
      <div className="absolute inset-0 z-0 h-screen w-screen pointer-events-none">
        <Spline scene="https://prod.spline.design/cZxfElHxDVoku4mO/scene.splinecode" />
      </div>

      <div className="max-w-xl mt-10  p-6 rounded-lg shadow-lg z-10 relative ">
        <h2 className="text-6xl font-bold mb-4 alfa-slab-one-regular">
          Welcome, {profile.username}!
        </h2>

        <div className="mb-4">
          <p className="text-lg font-semibold">Bio:</p>
          {!editing ? (
            <>
              <p className="italic">{bio || "Not set"}</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 px-4 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400"
              >
                Edit Bio
              </button>
            </>
          ) : (
            <>
              <textarea
                className="w-full p-2 mt-2 text-black border border-white rounded"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                >
                  Update Bio
                </button>
                <button
                  onClick={() => {
                    setBio(profile.bio || "");
                    setEditing(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-300">
          <p>
            <strong>Streak:</strong> {profile.streak}
          </p>
          <p>
            <strong>Badges:</strong>{" "}
            {profile.badges?.length
              ? profile.badges.join(", ")
              : "No badges yet"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profile.joined_at).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 mt-6 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>

      <div className="bottom-5 right-5 absolute h-[38px] w-[140px] bg-black bg-opacity-80 text-white flex items-center justify-center rounded z-20 shadow-lg border border-white cursor-pointer hover:bg-opacity-90">
        Contact us
      </div>
    </div>
  );
}
