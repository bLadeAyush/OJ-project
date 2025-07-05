"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar.jsx";
import {
  Search,
  Filter,
  Code,
  CheckCircle,
  Clock,
  AlertTriangle,
  Tag,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("problems/")
      .then((res) => {
        setProblems(res.data);
        setFilteredProblems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load problems");
        setLoading(false);
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

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          color: "text-green-400",
          bg: "bg-green-400/10",
          border: "border-green-400/30",
          icon: <CheckCircle className="w-4 h-4" />,
          emoji: "🟢",
        };
      case "medium":
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/30",
          icon: <Clock className="w-4 h-4" />,
          emoji: "🟡",
        };
      case "hard":
        return {
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/30",
          icon: <AlertTriangle className="w-4 h-4" />,
          emoji: "🔴",
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          border: "border-gray-400/30",
          icon: <Code className="w-4 h-4" />,
          emoji: "⚪",
        };
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading problems...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Practice Problems
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Sharpen your coding skills with our curated collection of
              programming challenges
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by problem name or tags..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="pl-12 pr-8 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[200px]"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                Showing {filteredProblems.length} of {problems.length} problems
              </span>
            </div>
          </div>

          {filteredProblems.length > 0 ? (
            <div className="grid gap-4">
              {filteredProblems.map((problem) => {
                const diffConfig = getDifficultyConfig(problem.difficulty);

                return (
                  <Link to={`/problems/${problem.code}`} key={problem.id}>
                    <div className="group bg-gray-800/30 hover:bg-gray-700/40 border border-gray-700/50 hover:border-cyan-500/30 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                              {problem.name}
                            </h3>
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${diffConfig.bg} ${diffConfig.border} ${diffConfig.color}`}
                            >
                              {diffConfig.icon}
                              {problem.difficulty}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-400" />
                            {problem.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-lg text-xs font-medium border border-gray-600/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 mt-4 transition-opacity ">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-cyan-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No problems found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setDifficulty("All");
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded-xl font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
