"use client";

import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  Calendar,
  Clock,
  Trophy,
  Zap,
  CheckCircle,
  PlayCircle,
  Flag,
} from "lucide-react";

export default function ContestPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/contests/")
      .then((res) => {
        setContests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const register = async (contestId) => {
    try {
      const res = await api.post(`/contests/${contestId}/register/`);
      toast.success("🎉 Successfully registered for contest!");
      setContests((prev) =>
        prev.map((c) =>
          c.id === contestId ? { ...c, is_registered: true } : c
        )
      );
    } catch (err) {
      toast.error("❌ Error registering for contest");
    }
  };

  const now = new Date();
  const upcomingContests = contests.filter(
    (contest) => new Date(contest.end_time) > now
  );
  const pastContests = contests.filter(
    (contest) => new Date(contest.end_time) <= now
  );

  const getContestStatus = (contest) => {
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "live";
    return "ended";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const renderContestCard = (contest, isPast = false) => {
    const status = getContestStatus(contest);
    const startDateTime = formatDateTime(contest.start_time);
    const endDateTime = formatDateTime(contest.end_time);

    return (
      <div
        key={contest.id}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
          status === "live"
            ? "bg-gradient-to-br from-green-900/20 to-emerald-800/20 border-green-500/30 shadow-lg shadow-green-500/10"
            : isPast
            ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50"
            : "bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10"
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          {status === "live" && (
            <div className="flex items-center gap-1 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              LIVE
            </div>
          )}
          {status === "upcoming" && (
            <div className="flex items-center gap-1 bg-cyan-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              <Clock className="w-3 h-3" />
              UPCOMING
            </div>
          )}
          {status === "ended" && (
            <div className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              <Flag className="w-3 h-3" />
              ENDED
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3 pr-20">
            {contest.title}
          </h2>

          <p className="text-gray-400 mb-6 line-clamp-2">
            {contest.description ||
              "Join this exciting coding contest and test your programming skills!"}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Calendar className="w-4 h-4" />
                <span className="text-gray-300">Start:</span>
              </div>
              <div className="text-white">
                {startDateTime.date} at {startDateTime.time}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-red-400">
                <Clock className="w-4 h-4" />
                <span className="text-gray-300">End:</span>
              </div>
              <div className="text-white">
                {endDateTime.date} at {endDateTime.time}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {isPast ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700/50 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
              >
                <Flag className="w-4 h-4" />
                Contest Ended
              </button>
            ) : contest.is_registered ? (
              new Date(contest.start_time) <= now ? (
                <button
                  onClick={() =>
                    (window.location.href = `/contests/${contest.id}/problems`)
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-green-500/30"
                >
                  <PlayCircle className="w-5 h-5" />
                  Enter Contest
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-black rounded-xl font-bold cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Registered
                </button>
              )
            ) : (
              <button
                onClick={() => register(contest.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
              >
                <Zap className="w-5 h-5" />
                Register Now
              </button>
            )}
          </div>
        </div>

        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading contests...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Upcoming Contests
              </h1>
            </div>

            {upcomingContests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {upcomingContests.map((contest) => renderContestCard(contest))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No upcoming contests at the moment.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Check back later for new challenges!
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <Flag className="w-8 h-8 text-gray-400" />
              <h1 className="text-4xl font-bold text-gray-400">
                Past Contests
              </h1>
            </div>

            {pastContests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {pastContests.map((contest) =>
                  renderContestCard(contest, true)
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No past contests to display.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
