import AboutHero from "../../components/about/AboutHero";
import ProblemStatement from "../../components/about/ProblemStatement";
import HowItWorks from "../../components/about/HowItWorks";
import Features from "../../components/about/Features";
import AboutCTA from "../../components/about/AboutCTA";
import AboutLinks from "../../components/about/AboutLinks";

export default function About() {
    return (
        <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text)]">
            <AboutHero />
            <ProblemStatement />
            <HowItWorks />
            <Features />
            <AboutCTA />
            <AboutLinks />
        </main>
    );
}