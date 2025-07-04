"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar.jsx";
import { toast } from "react-toastify";
import {
  Play,
  Send,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Terminal,
  History,
  Lightbulb,
} from "lucide-react";

export default function ProblemDetail() {
  const [problem, setProblem] = useState(null);
  const [code_p, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [verdict, setVerdict] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const { code } = useParams();

  const defaultTemplates = {
    python: `# Write your solution here\ndef solve():\n    # Your code goes here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Your code here\n    \n    return 0;\n}`,
    java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n        // Your code here\n        \n        sc.close();\n    }\n}`,
  };

  useEffect(() => {
    api.get(`problems/${code}/`).then((res) => setProblem(res.data));
    api
      .get(`submissions/?problem=${code}`)
      .then((res) => setSubmissions(res.data));
  }, [code, verdict]);

  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${language}_${code}`);
    setCode(savedCode || defaultTemplates[language]);
  }, [language, code]);

  useEffect(() => {
    if (!submissionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`submission/${submissionId}/`);
        if (res.data.verdict !== "PENDING") {
          setVerdict(res.data.verdict);
          setIsSubmitting(false);
          clearInterval(interval);
        }
      } catch {
        setIsSubmitting(false);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [submissionId, verdict]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post("submit/", {
        problem_code: code,
        language,
        code: code_p,
      });
      setVerdict("PENDING");
      setOutput("");
      setSubmissionId(res.data.submission_id);
      toast.success("Code submitted successfully!");
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Error submitting code");
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const res = await api.post("run/", {
        language,
        code: code_p,
        input: customInput,
      });
      setOutput(res.data.output || "");
      setVerdict(res.data.error ? `Error: ${res.data.error}` : "");
      setIsRunning(false);
    } catch (err) {
      setIsRunning(false);
      toast.error("Error running code");
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "AC":
        return "bg-green-500 text-black";
      case "WA":
        return "bg-red-500 text-white";
      case "TLE":
        return "bg-yellow-500 text-black";
      case "PENDING":
        return "bg-blue-500 text-white animate-pulse";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "AC":
        return <CheckCircle className="w-4 h-4" />;
      case "WA":
        return <XCircle className="w-4 h-4" />;
      case "TLE":
        return <Clock className="w-4 h-4" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "hard":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  if (!problem)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading problem...</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
        {/* Problem Panel */}
        <div className="lg:w-1/2 border-r border-gray-800">
          <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{problem.name}</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-6">
            {/* Problem Statement */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">
                  Problem Statement
                </h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{problem.statement}</ReactMarkdown>
              </div>
            </div>

            {/* Input Format */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Input Format
              </h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{problem.input_format}</ReactMarkdown>
              </div>
            </div>

            {/* Output Format */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Output Format
              </h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{problem.output_format}</ReactMarkdown>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Constraints
              </h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{problem.constraints}</ReactMarkdown>
              </div>
            </div>

            {/* Sample Input/Output */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Sample Input
                </h3>
                <pre className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm overflow-x-auto border border-gray-700">
                  {problem.sample_input}
                </pre>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Sample Output
                </h3>
                <pre className="bg-gray-900 p-4 rounded-lg text-blue-400 text-sm overflow-x-auto border border-gray-700">
                  {problem.sample_output}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="lg:w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-cyan-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isRunning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 bg-gray-900">
            <Editor
              height="400px"
              language={language}
              theme="vs-dark"
              value={code_p}
              onChange={(value) => {
                setCode(value);
                localStorage.setItem(`code_${language}_${code}`, value);
              }}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 16, bottom: 16 },
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Input/Output Section */}
          <div className="p-4 border-t border-gray-800 space-y-4">
            {/* Custom Input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <label className="text-sm font-semibold text-gray-300">
                  Custom Input
                </label>
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter your test input here..."
              />
            </div>

            {/* Verdict */}
            {verdict && (
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${getVerdictColor(
                    verdict
                  )}`}
                >
                  {getVerdictIcon(verdict)}
                  Verdict: {verdict}
                </div>
              </div>
            )}

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <label className="text-sm font-semibold text-gray-300">
                    Output
                  </label>
                </div>
                <pre className="bg-gray-800 text-green-400 p-3 rounded-lg border border-gray-600 text-sm overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>

          {/* Submissions History */}
          <div className="p-4 border-t border-gray-800 max-h-80 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">
                Submission History
              </h3>
            </div>

            <div className="space-y-2">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <Disclosure key={sub.id}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex justify-between items-center w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-colors border border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">
                              #{sub.id}
                            </span>
                            <span className="text-sm font-medium">
                              {sub.language}
                            </span>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getVerdictColor(
                                sub.verdict
                              )}`}
                            >
                              {getVerdictIcon(sub.verdict)}
                              {sub.verdict}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(sub.submitted_at).toLocaleString()}
                            </span>
                          </div>
                          <ChevronUpIcon
                            className={`${
                              open ? "rotate-180" : ""
                            } w-5 h-5 text-gray-400 transition-transform`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                            {sub.code}
                          </pre>

                          {sub.feedback && (
                            <div className="mt-4">
                              <button
                                onClick={() =>
                                  setFeedbackOpen((prev) => ({
                                    ...prev,
                                    [sub.id]: !prev[sub.id],
                                  }))
                                }
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                <Lightbulb className="w-4 h-4" />
                                {feedbackOpen[sub.id] ? "Hide" : "View"} AI
                                Feedback
                              </button>
                              {feedbackOpen[sub.id] && (
                                <div className="mt-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>
                                      {sub.feedback}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No submissions yet</p>
                  <p className="text-gray-500 text-sm">
                    Submit your solution to see history
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
