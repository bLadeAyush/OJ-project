import { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/profile", label: "Home" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/problems", label: "Problems" },
    { to: "/contests", label: "Contests" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black text-white px-6 shadow-md z-50 sticky top-0">
      <div className="flex justify-between items-center w-full py-2">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={assets.logoCode || "/placeholder.svg"}
            alt="Logo"
            width={140}
            className="h-10 w-auto"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 text-sm lg:text-base jet-brains-mono">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white hover:text-cyan-400 hover:bg-gray-800 p-2 rounded transition duration-300"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black border-l border-gray-800 transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <img
              src={assets.logoCode || "/placeholder.svg"}
              alt="Logo"
              width={112}
              className="h-8 w-auto"
            />
            <button
              onClick={closeMenu}
              className="text-white hover:text-cyan-400 p-2 rounded transition duration-300"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <MobileNavLink
                key={link.to}
                to={link.to}
                label={link.label}
                onClick={closeMenu}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="hover:text-cyan-400 hover:drop-shadow-[0_0_10px_#22d3ee] transition duration-300 jet-brains-mono"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-white hover:text-cyan-400 hover:drop-shadow-[0_0_10px_#22d3ee] transition duration-300 jet-brains-mono text-lg py-3 border-b border-gray-800 last:border-b-0 block"
    >
      {label}
    </Link>
  );
}
