import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Disclosure } from "@headlessui/react";
import ChevronUpIcon from "@heroicons/react/24/solid/ChevronUpIcon";

export default function ProblemDetail() {
  const [submissions, setSubmissions] = useState([]);

  const [problem, setProblem] = useState(null);
  const { code } = useParams();
  const [language, setLanguage] = useState("python");
  const [code_p, setCode] = useState("");
  const [verdict, setVerdict] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    api.get(`submissions/?problem=${code}`).then((res) => {
      setSubmissions(res.data);
    });
  }, [code, verdict]);
  useEffect(() => {
    api
      .get(`problems/${code}/`)
      .then((res) => setProblem(res.data))
      .catch(() => alert("Problem not found"));
  }, [code]);

  useEffect(() => {
    if (!submissionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`submission/${submissionId}/`);
        if (res.data.verdict !== "PENDING") {
          setVerdict(res.data.verdict);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submissionId]);

  const handleSubmit = async () => {
    try {
      const res = await api.post("submit/", {
        problem_code: code,
        language,
        code: code_p,
      });
      setVerdict("PENDING");
      setOutput("Run Code to see Output");
      setSubmissionId(res.data.submission_id);
    } catch (err) {
      alert("Submission failed: " + JSON.stringify(err.response?.data));
    }
  };

  const handleRun = async () => {
    try {
      const res = await api.post("run/", {
        language,
        code: code_p,
        input: customInput,
      });
      setOutput(res.data.output || "");
      setVerdict(res.data.error ? `Error: ${res.data.error}` : "");
    } catch (err) {
      alert("Run failed: " + JSON.stringify(err.response?.data));
    }
  };

  if (!problem) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">{problem.name}</h1>
      <p className="text-sm text-gray-500">Difficulty: {problem.difficulty}</p>
      <hr />
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

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Code Editor</h3>
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

        <textarea
          placeholder="Enter custom input..."
          className="w-full p-2 border mt-4"
          rows={4}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleRun}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Run
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>

        {verdict && (
          <p className="mt-4 font-bold text-green-600">Verdict: {verdict}</p>
        )}
        {output && (
          <div className="mt-4">
            <h4 className="font-semibold">Output:</h4>
            <pre className="bg-gray-100 p-2 rounded">{output}</pre>
          </div>
        )}
      </div>
      {submissions.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Your Past Submissions</h3>
          {submissions.map((sub) => (
            <Disclosure key={sub.id}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-200 rounded-lg hover:bg-gray-300">
                    <span>
                      #{sub.id} | {sub.language} | {sub.verdict} |{" "}
                      {new Date(sub.submitted_at).toLocaleString()}
                    </span>
                    <ChevronUpIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 py-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-100 rounded">
                    {sub.code}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      )}
    </div>
  );
}
