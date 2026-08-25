import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="bg-white py-20 sm:py-24 dark:bg-[#0B1C15]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#10B981] px-6 py-14 text-center shadow-xl sm:px-10 sm:py-16 lg:px-16 dark:bg-[#10251D]">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#34D399]/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white dark:bg-[#16382B] dark:text-[#34D399]">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl dark:text-[#ECFDF5]">
              Ready to simplify your workflow?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg dark:text-[#A7C4B5]">
              Start organizing your tasks, projects, and team today. Build a
              better workflow with TaskFlow.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 font-semibold text-[#047857] transition hover:bg-[#ECFDF5] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#6EE7B7]"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10 dark:border-[#2D5A47] dark:text-[#ECFDF5] dark:hover:bg-[#16382B]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
