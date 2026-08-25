import { Link } from "react-router-dom";
import { FiArrowUp, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import { BRAND } from "../../constants/brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-[#D1FAE5] bg-white dark:border-[#1B4332] dark:bg-[#07130F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={BRAND.logo}
                alt={`${BRAND.name} logo`}
                className="block h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
              />

              <span className="-ml-2 text-lg font-bold tracking-tight text-[#17201B] dark:text-[#ECFDF5]">
                Task
                <span className="text-[#10B981] dark:text-[#34D399]">Flow</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-[#A7C4B5]">
              A simple and powerful task management platform designed to help
              teams stay organized, productive, and focused.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TaskFlow GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1FAE5] text-[#17201B] transition-colors hover:border-[#6EE7B7] hover:bg-[#ECFDF5] hover:text-[#10B981] dark:border-[#2D5A47] dark:text-[#ECFDF5] dark:hover:bg-[#10251D] dark:hover:text-[#34D399]"
              >
                <FiGithub size={18} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TaskFlow LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1FAE5] text-[#17201B] transition-colors hover:border-[#6EE7B7] hover:bg-[#ECFDF5] hover:text-[#10B981] dark:border-[#2D5A47] dark:text-[#ECFDF5] dark:hover:bg-[#10251D] dark:hover:text-[#34D399]"
              >
                <FiLinkedin size={18} />
              </a>

              <a
                href="mailto:support@taskflow.com"
                aria-label="Email TaskFlow support"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1FAE5] text-[#17201B] transition-colors hover:border-[#6EE7B7] hover:bg-[#ECFDF5] hover:text-[#10B981] dark:border-[#2D5A47] dark:text-[#ECFDF5] dark:hover:bg-[#10251D] dark:hover:text-[#34D399]"
              >
                <FiMail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17201B] dark:text-[#ECFDF5]">
              Product
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/#features"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  How It Works
                </a>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17201B] dark:text-[#ECFDF5]">
              Account
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17201B] dark:text-[#ECFDF5]">
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:support@taskflow.com"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Contact
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-[#10B981] dark:text-[#A7C4B5] dark:hover:text-[#34D399]"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#D1FAE5] pt-6 sm:flex-row dark:border-[#1B4332]">
          <p className="text-center text-sm text-gray-500 dark:text-[#789A8A] sm:text-left">
            © {currentYear} {BRAND.name}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#10B981] transition-colors hover:bg-[#D1FAE5] dark:bg-[#10251D] dark:text-[#34D399] dark:hover:bg-[#16382B]"
          >
            <FiArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
