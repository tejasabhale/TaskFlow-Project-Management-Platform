import ScrollWords from "./ScrollWords";

export default function ProblemStatement() {
    return (
        <section className="border-y border-[var(--border)] bg-[var(--surface)] px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-5xl">
                <ScrollWords
                    text="Work ends up scattered across chats, documents and spreadsheets. Then keeping track of it becomes a job of its own. TaskFlow puts workspaces, projects and tasks in one place, so the next step is always clear."
                    className="text-2xl min-[400px]:text-3xl font-extrabold leading-[1.28] tracking-[-0.03em] text-[var(--text)] sm:text-4xl lg:text-5xl"
                />
            </div>
        </section>
    );
}