import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 shadow-md z-100">
      <div className=" flex justify-around items-center w-screen">
        <div className="space-x-29 text-sm sm:text-base jet-brains-mono  ">
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
