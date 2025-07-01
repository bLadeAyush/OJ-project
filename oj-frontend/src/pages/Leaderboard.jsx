import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [data, setData] = useState([]);

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
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 bg-black text-white">
        <h2 className="text-4xl font-bold mb-6 text-cyan-400">
          🏆 Leaderboard
        </h2>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full table-auto border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-800 text-cyan-300">
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Problems Solved</th>
                <th className="p-3 text-left">Points</th>
                <th className="p-3 text-left">Fastest Solve (s)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, idx) => (
                <tr
                  key={entry.username}
                  className="border-b border-gray-700 hover:bg-gray-800 transition duration-200"
                >
                  <td className="p-3 text-cyan-200 font-semibold">{idx + 1}</td>
                  <td className="p-3">{entry.username}</td>
                  <td className="p-3">{entry.total_ac}</td>
                  <td className="p-3">{entry.total_points}</td>
                  <td className="p-3">{entry.avg_time?.toFixed(2) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
