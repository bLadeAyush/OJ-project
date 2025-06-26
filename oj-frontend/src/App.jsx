import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import ProblemsList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";

export default function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}
