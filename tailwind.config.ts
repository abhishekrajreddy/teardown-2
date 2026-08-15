import type { Config } from "tailwindcss";

// Colors and type scale here are pulled directly from teardown-mockup.html
// so the built app matches the approved design, not a reinterpretation of it.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#14151A",
        charcoal: "#1D1F26",
        iron: "#2A2D36",
        bone: "#ECE9E2",
        "bone-dim": "#9A978E",
        ember: "#E2853D",
        "ember-dim": "#7A5636",
        moss: "#7C9A79",
        "moss-dim": "#465C46",
        volt: "#3E7BFA",
        "volt-dim": "#264A96",
        rust: "#B4472A",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
