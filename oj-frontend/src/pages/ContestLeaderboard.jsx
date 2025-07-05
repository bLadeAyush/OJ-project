import { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams } from "react-router-dom";

export default function ContestLeaderboard() {
  const { id } = useParams();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api
      .get(`/contests/${id}/leaderboard/`)
      .then((res) => setEntries(res.data))
      .catch((err) => console.error("Failed to load leaderboard", err));
  }, [id]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">🏆 Contest Leaderboard</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="py-2">#</th>
            <th className="py-2">Username</th>
            <th className="py-2">Solved</th>
            <th className="py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.user_id}
              className="border-b border-gray-800 hover:bg-gray-800/50"
            >
              <td className="py-2">{idx + 1}</td>
              <td className="py-2">{entry.username}</td>
              <td className="py-2">{entry.solved}</td>
              <td className="py-2">{Math.floor(entry.time / 60)} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
