"use client";

import { useParams } from "react-router-dom"; // or `useRouter` if Next.js
import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ContestProblemsPage() {
  const { id } = useParams(); // Get contest ID from URL
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/contests/${id}/problems/`)
      .then((res) => {
        setProblems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.error ||
            "You are not registered or contest inactive."
        );
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <p>Loading contest problems...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Contest Problems
      </h1>

      <div className="space-y-4">
        {console.log(problems)}
        {problems.map((p, index) => (
          <div
            key={p.problem.code}
            className="border border-cyan-600 bg-gray-900 p-5 rounded-xl hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              {String.fromCharCode(65 + index)}. {p.problem.name}
            </h2>
            <p className="text-gray-300 line-clamp-2">{p.problem.statement}</p>
            <a
              href={`/problems/${p.problem.code}`}
              className="text-cyan-400 hover:underline text-sm mt-3 inline-block"
            >
              View Full Problem →
            </a>
          </div>
        ))}
        <button
          onClick={() =>
            (window.location.href = `/contests/${id}/leaderboard/`)
          }
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
}
