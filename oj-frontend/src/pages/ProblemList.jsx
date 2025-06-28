import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

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
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Problem List</h2>

      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or tag"
          className="p-2 border rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((p) => (
            <Link to={`/problems/${p.code}`} key={p.id}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">
                  Difficulty: {p.difficulty} | Tags: {p.tags.join(", ")}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500">No problems found.</p>
        )}
      </div>
    </div>
  );
}
