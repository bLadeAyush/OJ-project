import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios"; // ✅ shared axios with token

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    api
      .get("problems/")
      .then((res) => setProblems(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load problems");
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Problem List</h2>
      <div className="space-y-4">
        {problems.map((p) => (
          <Link to={`/problems/${p.code}`} key={p.id}>
            <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-500">
                Difficulty: {p.difficulty} | Tags: {p.tags.join(", ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
