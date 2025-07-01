import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/NavBar";

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  useEffect(() => {
    api
      .get("problems/")
      .then((res) => {
        setProblems(res.data);
        setFilteredProblems(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load problems");
      });
  }, []);

  useEffect(() => {
    let filtered = problems;

    if (difficulty !== "All") {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredProblems(filtered);
  }, [search, difficulty, problems]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-cyan-400 tracking-wide">
            🧠 Practice Problems
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8 space-y-4 sm:space-y-0">
            <input
              type="text"
              placeholder="🔍 Search by name or tag"
              className="p-3 w-full rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="p-3 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟠 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
          </div>

          {/* Problem Cards */}
          <div className="space-y-4">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((p) => (
                <Link to={`/problems/${p.code}`} key={p.id}>
                  <div className="p-5 rounded border border-gray-700 bg-gray-900 hover:shadow-[0_0_12px_#06b6d4] transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-cyan-200">
                        {p.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          p.difficulty === "Easy"
                            ? "bg-green-600"
                            : p.difficulty === "Medium"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      Tags: {p.tags.join(", ")}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-400">
                No problems found. Try changing filters or search.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
