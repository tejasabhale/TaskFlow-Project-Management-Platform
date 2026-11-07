import { useReducedMotion } from "framer-motion";

// framer's hook can return null on the first render, so normalise it to a boolean
export default function usePrefersReducedMotion() {
  return !!useReducedMotion();
}
