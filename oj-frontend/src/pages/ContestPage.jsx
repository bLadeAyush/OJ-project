import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar.jsx";
export default function ContestPage() {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    api
      .get("contests/")
      .then((res) => setContests(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleRegister = (id) => {
    api
      .post(`contests/${id}/register/`)
      .then(() => alert("Registered!"))
      .catch((err) => alert("Error registering"));
  };

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Contests</h1>
        {contests.map((contest) => (
          <div key={contest.id} className="border p-4 mb-2 rounded">
            <h2 className="text-xl font-semibold">{contest.title}</h2>
            <p>{contest.description}</p>
            <p>
              <strong>Starts:</strong>{" "}
              {new Date(contest.start_time).toLocaleString()}
            </p>
            <p>
              <strong>Ends:</strong>{" "}
              {new Date(contest.end_time).toLocaleString()}
            </p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => handleRegister(contest.id)}
            >
              Register
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
