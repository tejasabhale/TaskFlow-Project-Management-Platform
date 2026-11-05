
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    const previousScrollRestoration =
      window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      anchors: true,

      // Handle marked modal and nested scroll areas natively.
      allowNestedScroll: false,

      prevent: (node) => {
        return Boolean(
          node?.closest?.("[data-lenis-prevent]")
        );
      },
    });

    window.lenis = lenis;

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", updateScrollTrigger);

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);

      if (window.lenis === lenis) {
        delete window.lenis;
      }

      lenis.destroy();

      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration =
          previousScrollRestoration;
      }
    };
  }, []);

  return null;
}
