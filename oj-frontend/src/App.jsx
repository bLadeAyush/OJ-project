import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import ProblemsList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Leaderboard from "./pages/Leaderboard";
import { ToastContainer } from "react-toastify";
import ContestPage from "./pages/ContestPage";
import "react-toastify/dist/ReactToastify.css";
import ContestProblemsPage from "./pages/ContestProblemPage";
import ContestLeaderboard from "./pages/ContestLeaderboard";

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/problems" element={<ProblemsList />} />
        <Route path="/problems/:code" element={<ProblemDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/contests" element={<ContestPage />} />
        <Route
          path="/contests/:id/problems"
          element={<ContestProblemsPage />}
        ></Route>
        <Route
          path="/contests/:id/leaderboard"
          element={<ContestLeaderboard />}
        ></Route>
      </Routes>
    </Router>
  );
}
