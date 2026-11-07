import ContactIntro from "../../components/contact/ContactIntro";
import ContactForm from "../../components/contact/ContactForm";

export default function Contact() {
    return (
        <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text)]">
            <section className="relative px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
                {/* faint dot grid, fades out toward the edges */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_30%_30%,black,transparent_70%)]"
                />

                <div className="relative mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                    <ContactIntro />
                    <ContactForm />
                </div>
            </section>

        </main>
    );
}