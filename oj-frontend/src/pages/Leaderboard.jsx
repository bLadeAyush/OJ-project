"use client";

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Trophy, Medal, Award, Crown, Timer, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return (
        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[#b5bac1]">
          #{rank}
        </span>
      );
  }
};

const getRankBadgeColor = (rank) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    case 3:
      return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    default:
      return "bg-slate-100 text-[#dbdee1]";
  }
};

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get("/leaderboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#b5bac1]">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#1e1f22] text-white">
        <div className="bg-[#2b2d31] sticky top-0 z-10 border-b border-[#3a3b3f]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-cyan-300">Leaderboard</h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {data.slice(0, 3).map((entry, idx) => (
              <Card
                key={entry.username}
                className={`relative overflow-hidden bg-[#2b2d31] border border-[#3a3b3f] text-white ${
                  idx === 0
                    ? "md:order-2 transform md:scale-105"
                    : idx === 1
                    ? "md:order-1"
                    : "md:order-3"
                }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(idx + 1)}
                  </div>
                  <CardTitle className="text-lg font-bold">
                    {entry.username}
                  </CardTitle>
                  <Badge
                    className={`${getRankBadgeColor(idx + 1)} text-xs w-full`}
                  >
                    {idx === 0
                      ? "🥇 Champion"
                      : idx === 1
                      ? "🥈 Runner-up"
                      : "🥉 Third Place"}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center space-y-2 text-slate-300">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>{entry.total_ac} solved</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>{entry.total_points} points</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Timer className="w-4 h-4 text-orange-400" />
                    <span>
                      {entry.avg_time !== null
                        ? `${entry.avg_time.toFixed(1)}s avg`
                        : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#2b2d31] border border-[#3a3b3f] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Award className="w-5 h-5 text-cyan-400" />
                Complete Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#3a3b3f] bg-[#1e1f22]">
                      <th className="text-left p-4 font-semibold text-slate-300">
                        Rank
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-300">
                        Player
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-300">
                        Problems
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-300">
                        Points
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-300">
                        Avg Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((entry, idx) => (
                      <tr
                        key={entry.username}
                        className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-all duration-200 ${
                          idx < 3
                            ? "bg-gradient-to-r from-gray-800/30 to-transparent"
                            : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getRankIcon(idx + 1)}
                            <span
                              className={`font-bold ${
                                idx < 3 ? "text-cyan-400" : "text-gray-300"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`font-semibold ${
                              idx < 3 ? "text-white" : "text-gray-200"
                            }`}
                          >
                            {entry.username}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span className="font-medium text-gray-300">
                              {entry.total_ac}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-gray-300">
                              {entry.total_points}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-gray-300">
                              {entry.avg_time !== null
                                ? `${entry.avg_time.toFixed(1)}s`
                                : "—"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
