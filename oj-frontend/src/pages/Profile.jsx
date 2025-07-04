"use client";

import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import "../index.css";
import Navbar from "../components/Navbar.jsx";
import {
  User,
  Edit3,
  Save,
  X,
  LogOut,
  Calendar,
  Award,
  Flame,
  MessageCircle,
  Trophy,
  Settings,
  Star,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("users/profile/")
      .then((res) => {
        setProfile(res.data);
        setBio(res.data.bio || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = () => {
    api
      .put("users/profile/", { bio: bio })
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <p className="text-gray-400 text-lg">Failed to load profile</p>
        </div>
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <Navbar />

      <div className="absolute inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/5kPlEdKfHEk6BZe5/scene.splinecode"
          showSplineWatermark={false}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60 z-10"></div>

      <div className="relative z-20 min-h-screen p-4 lg:p-8">
        <div className="absolute top-20 left-4 lg:left-8 max-w-sm">
          <div className="p-6 ">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white alfa-slab-one-regular">
                  Welcome {profile.username}
                </h1>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Since{" "}
                    {new Date(profile.joined_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-2 rounded-lg border border-cyan-500/30 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg border border-red-500/30 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Top Right - Stats Cards */}
        <div className="absolute top-20 right-4 lg:right-8 space-y-4 max-w-xs">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 text-center shadow-2xl shadow-orange-500/10">
            <div className="flex justify-center mb-3">
              <Flame className="w-10 h-10 text-orange-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile.streak}
            </div>
            <div className="text-sm text-gray-300">Day Streak</div>
          </div>

          {/* Badges Card */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center shadow-2xl shadow-purple-500/10">
            <div className="flex justify-center mb-3">
              <Award className="w-10 h-10 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile.badges?.length || 0}
            </div>
            <div className="text-sm text-gray-300">Badges</div>
          </div>

          {/* Days Active Card */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center shadow-2xl shadow-green-500/10">
            <div className="flex justify-center mb-3">
              <Calendar className="w-10 h-10 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {Math.floor(
                (new Date() - new Date(profile.joined_at)) /
                  (1000 * 60 * 60 * 24)
              )}
            </div>
            <div className="text-sm text-gray-300">Days Active</div>
          </div>
        </div>

        {/* Bottom Left - Bio Section */}
        <div className="absolute bottom-8 left-4 lg:left-8 max-w-md">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                About Me
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {!editing ? (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {bio ||
                    "No bio set yet. Click edit to add something about yourself!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  className="w-full bg-gray-800/50 text-white p-3 rounded-xl border border-gray-600 focus:border-cyan-400 focus:outline-none resize-none text-sm"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setBio(profile.bio || "");
                      setEditing(false);
                    }}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right - Achievements */}
        <div className="absolute bottom-8 right-4 lg:right-8 max-w-sm">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              Achievements
            </h2>

            {profile.badges?.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 text-yellow-400 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                  >
                    <Star className="w-3 h-3" />
                    {badge}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No badges yet</p>
                <p className="text-gray-500 text-xs">
                  Complete challenges to earn badges!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center Bottom - Welcome Message */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-8 py-4 shadow-2xl shadow-cyan-500/10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-center alfa-slab-one-regular">
              Welcome to Your Profile
            </h1>
            <p className="text-gray-300 text-center text-sm mt-2">
              Your coding journey continues here
            </p>
          </div>
        </div>

        <div className="fixed top-1/2 left-4 transform -translate-y-1/2 space-y-4 z-30">
          <button className="w-12 h-12 bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-sm border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 transition-colors shadow-lg">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 transition-colors shadow-lg">
            <Trophy className="w-5 h-5" />
          </button>
        </div>

        <div className="fixed bottom-5 right-5 z-30">
          <button className="bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800/80 text-white px-6 py-3 rounded-full border border-gray-700/50 transition-colors shadow-lg">
            Contact us
          </button>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(
            circle at center,
            var(--tw-gradient-stops)
          );
        }
      `}</style>
    </div>
  );
}
