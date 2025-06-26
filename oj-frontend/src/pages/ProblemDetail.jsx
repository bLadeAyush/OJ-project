import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; // ✅ use shared axios instance

export default function ProblemDetail() {
  const [problem, setProblem] = useState(null);
  const { code } = useParams();
  const [language, setLanguage] = useState("python");
  const [code_p, setCode] = useState("");
  const [verdict, setVerdict] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api
      .get(`problems/${code}/`) // ✅ baseURL already includes /api/
      .then((res) => setProblem(res.data))
      .catch((err) => {
        console.error(err);
        alert("Problem not found");
      });
  }, [code]);

  const handleSubmit = async () => {
    try {
      const res = await api.post("submit/", {
        problem_code: code,
        language,
        code: code_p,
      });
      setVerdict(res.data.verdict);
    } catch (err) {
      console.error(err.response?.data); // 🔍 log the actual server error message
      alert("Submission failed: " + JSON.stringify(err.response?.data));
    }
  };

  if (!problem) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">{problem.name}</h1>
      <p className="text-sm text-gray-500">Difficulty: {problem.difficulty}</p>
      <hr />

      {/* Problem content */}
      <div>
        <h2 className="font-semibold">Problem Statement</h2>
        <p>{problem.statement}</p>
      </div>
      <div>
        <h2 className="font-semibold">Input Format</h2>
        <p>{problem.input_format}</p>
      </div>
      <div>
        <h2 className="font-semibold">Output Format</h2>
        <p>{problem.output_format}</p>
      </div>
      <div>
        <h2 className="font-semibold">Constraints</h2>
        <p>{problem.constraints}</p>
      </div>
      <div>
        <h2 className="font-semibold">Sample Input</h2>
        <pre className="bg-gray-100 p-2 rounded">{problem.sample_input}</pre>
      </div>
      <div>
        <h2 className="font-semibold">Sample Output</h2>
        <pre className="bg-gray-100 p-2 rounded">{problem.sample_output}</pre>
      </div>

      {/* Code editor */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Submit Your Code</h3>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border mb-4"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <Editor
          height="300px"
          language={language}
          theme="vs"
          value={code_p}
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 14,
            fontFamily: "Fira Code, monospace",
            minimap: { enabled: false },
            padding: { top: 20, bottom: 20 },
          }}
        />

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>

        {verdict && (
          <p className="mt-4 font-bold text-green-600">Verdict: {verdict}</p>
        )}
      </div>
    </div>
  );
}
