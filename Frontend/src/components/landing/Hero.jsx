import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#ECFDF5] dark:bg-[#07130F]">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_35%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-white/80 px-4 py-2 text-sm font-medium text-[#047857] shadow-sm backdrop-blur dark:border-[#2D5A47] dark:bg-[#10251D]/80 dark:text-[#6EE7B7]">
              <CheckCircle2 size={16} />
              Simplify your workflow
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#17201B] sm:text-5xl lg:text-6xl dark:text-[#ECFDF5]">
              Plan.
              <span className="text-[#10B981] dark:text-[#34D399]">
                {" "}
                Organize.
              </span>
              <br />
              Get Things Done.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#52635A] sm:text-lg sm:leading-8 dark:text-[#A7C4B5]">
              TaskFlow helps you manage tasks, organize projects, collaborate
              with your team, and keep your work moving forward — all in one
              simple workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] px-6 py-3.5 font-semibold text-white transition hover:bg-[#059669] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#6EE7B7]"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-[#10B981] px-6 py-3.5 font-semibold text-[#047857] transition hover:bg-[#D1FAE5] dark:border-[#34D399] dark:text-[#6EE7B7] dark:hover:bg-[#10251D]"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#52635A] dark:text-[#A7C4B5]">
              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#10B981] dark:text-[#34D399]"
                />
                Simple to use
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#10B981] dark:text-[#34D399]"
                />
                Team collaboration
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-[#10B981] dark:text-[#34D399]"
                />
                Stay organized
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-4 rounded-3xl bg-[#10B981]/10 blur-2xl dark:bg-[#34D399]/10" />

            <div className="relative overflow-hidden rounded-2xl border border-[#A7F3D0] bg-white p-4 shadow-2xl sm:p-6 dark:border-[#2D5A47] dark:bg-[#10251D]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B7C73] dark:text-[#789A8A]">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[#17201B] dark:text-[#ECFDF5]">
                    My Projects
                  </h2>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#10B981] dark:bg-[#16382B] dark:text-[#34D399]">
                  <CheckCircle2 size={19} />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Website Redesign",
                    progress: "75%",
                    tasks: "12 / 16 tasks",
                  },
                  {
                    title: "Mobile Application",
                    progress: "50%",
                    tasks: "8 / 16 tasks",
                  },
                  {
                    title: "Marketing Campaign",
                    progress: "35%",
                    tasks: "7 / 20 tasks",
                  },
                ].map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-[#E5F5EC] bg-[#F8FFFA] p-4 dark:border-[#1E4A38] dark:bg-[#0B1C15]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#17201B] dark:text-[#ECFDF5]">
                          {project.title}
                        </h3>

                        <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
                          {project.tasks}
                        </p>
                      </div>

                      <span className="text-sm font-semibold text-[#10B981] dark:text-[#34D399]">
                        {project.progress}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#DDF5E7] dark:bg-[#1E4A38]">
                      <div
                        className="h-full rounded-full bg-[#10B981] dark:bg-[#34D399]"
                        style={{ width: project.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#ECFDF5] p-3 dark:bg-[#16382B]">
                  <p className="text-xs text-[#6B7C73] dark:text-[#789A8A]">
                    Tasks
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#17201B] dark:text-[#ECFDF5]">
                    42
                  </p>
                </div>

                <div className="rounded-xl bg-[#ECFDF5] p-3 dark:bg-[#16382B]">
                  <p className="text-xs text-[#6B7C73] dark:text-[#789A8A]">
                    Projects
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#17201B] dark:text-[#ECFDF5]">
                    08
                  </p>
                </div>

                <div className="rounded-xl bg-[#ECFDF5] p-3 dark:bg-[#16382B]">
                  <p className="text-xs text-[#6B7C73] dark:text-[#789A8A]">
                    Done
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#17201B] dark:text-[#ECFDF5]">
                    28
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
