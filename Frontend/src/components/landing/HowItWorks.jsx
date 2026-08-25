import { UserPlus, ListChecks, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your workspace",
    description:
      "Set up your TaskFlow workspace and bring your projects and team into one organized place.",
  },
  {
    number: "02",
    icon: ListChecks,
    title: "Plan your work",
    description:
      "Create projects, add tasks, assign responsibilities, and organize everything around your goals.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Get things done",
    description:
      "Track progress, collaborate with your team, and move your work forward with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#ECFDF5] py-20 sm:py-24 dark:bg-[#07130F]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-white px-4 py-2 text-sm font-semibold text-[#047857] dark:border-[#2D5A47] dark:bg-[#10251D] dark:text-[#6EE7B7]">
            How It Works
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17201B] sm:text-4xl lg:text-5xl dark:text-[#ECFDF5]">
            Simple steps.
            <span className="text-[#10B981] dark:text-[#34D399]">
              {" "}
              Better workflow.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#52635A] sm:text-lg dark:text-[#A7C4B5]">
            Get started with TaskFlow in just a few simple steps and keep
            everything moving in the right direction.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-[#A7F3D0] md:block dark:bg-[#2D5A47]" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#ECFDF5] bg-[#10B981] text-white shadow-lg dark:border-[#07130F] dark:bg-[#34D399] dark:text-[#07130F]">
                  <Icon size={30} strokeWidth={2} />
                </div>

                <span className="mt-5 text-xs font-bold tracking-[0.2em] text-[#10B981] dark:text-[#34D399]">
                  STEP {step.number}
                </span>

                <h3 className="mt-3 text-xl font-bold text-[#17201B] dark:text-[#ECFDF5]">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#64756C] dark:text-[#A7C4B5]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
