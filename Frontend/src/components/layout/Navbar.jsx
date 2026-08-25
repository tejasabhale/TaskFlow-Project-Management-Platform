import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";

import useTheme from "../../hooks/useTheme";
import { BRAND } from "../../constants/brand";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#D1FAE5] bg-white/95 backdrop-blur-md dark:border-[#1B4332] dark:bg-[#07130F]/95">
      <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex min-w-0 items-center"
          >
            <img
              src={BRAND.logo}
              alt={`${BRAND.name} logo`}
              className="block h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />

            <span className="-ml-0.5 whitespace-nowrap text-lg font-bold tracking-tight text-[#17201B] dark:text-[#ECFDF5] sm:text-xl">
              Task
              <span className="text-[#10B981] dark:text-[#34D399]">Flow</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a
              href="/#features"
              className="text-sm font-medium text-[#17201B] transition-colors hover:text-[#10B981] dark:text-[#ECFDF5] dark:hover:text-[#34D399]"
            >
              Features
            </a>

            <a
              href="/#how-it-works"
              className="text-sm font-medium text-[#17201B] transition-colors hover:text-[#10B981] dark:text-[#ECFDF5] dark:hover:text-[#34D399]"
            >
              How It Works
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] text-[#17201B] transition-colors hover:border-[#6EE7B7] hover:text-[#10B981] dark:border-[#2D5A47] dark:bg-[#10251D] dark:text-[#ECFDF5] dark:hover:border-[#34D399] dark:hover:text-[#34D399]"
            >
              {isDarkMode ? <FiSun size={19} /> : <FiMoon size={19} />}
            </button>

            <Link
              to="/login"
              className="text-sm font-medium text-[#17201B] transition-colors hover:text-[#10B981] dark:text-[#ECFDF5] dark:hover:text-[#34D399]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#6EE7B7]"
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] text-[#17201B] dark:border-[#2D5A47] dark:bg-[#10251D] dark:text-[#ECFDF5]"
            >
              {isDarkMode ? <FiSun size={19} /> : <FiMoon size={19} />}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] text-[#17201B] dark:border-[#2D5A47] dark:bg-[#10251D] dark:text-[#ECFDF5]"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-[#D1FAE5] py-4 dark:border-[#1B4332] md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="/#features"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#17201B] hover:bg-[#ECFDF5] dark:text-[#ECFDF5] dark:hover:bg-[#10251D]"
              >
                Features
              </a>

              <a
                href="/#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#17201B] hover:bg-[#ECFDF5] dark:text-[#ECFDF5] dark:hover:bg-[#10251D]"
              >
                How It Works
              </a>

              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#17201B] hover:bg-[#ECFDF5] dark:text-[#ECFDF5] dark:hover:bg-[#10251D]"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-[#10B981] px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-[#34D399] dark:text-[#07130F]"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
