import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    // Let ScrollToTop control the page position on reload and route changes.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return undefined;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      anchors: true,
    });

    // Expose the instance so ScrollToTop can scroll immediately through Lenis.
    window.lenis = lenis;

    const handleScroll = () => ScrollTrigger.update();
    lenis.on("scroll", handleScroll);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(updateLenis);

      if (window.lenis === lenis) {
        delete window.lenis;
      }

      lenis.destroy();
    };
  }, []);

  return null;
}
