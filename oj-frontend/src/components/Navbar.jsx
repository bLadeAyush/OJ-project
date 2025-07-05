import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";
export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6  shadow-md z-100">
      <div className=" flex justify-between items-center w-screen pr-6 py-2">
        <img src={assets.logoCode} alt="Logo" width={140} />
        <div className="space-x-21 text-sm sm:text-base jet-brains-mono mr-10">
          <NavLink to="/profile" label="Home" />
          <NavLink to="/leaderboard" label="Leaderboard" />
          <NavLink to="/problems" label="Problems" />
          <NavLink to="/contests" label="Contests" />
        </div>
      </div>
    </nav>
  );
}
function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="hover:text-cyan-400 hover:drop-shadow-[0_0_10px_#22d3ee] transition duration-300"
    >
      {label}
    </Link>
  );
}
