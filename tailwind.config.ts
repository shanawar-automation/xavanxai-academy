import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        xavan: {
          black: "#080808",
          dark: "#101010",
          secondary: "#181818",
          white: "#FFFFFF",
          orange: "#F47735",
          orangeHover: "#FF884B",
          muted: "#A1A1AA",
          border: "rgba(255, 255, 255, 0.10)",
          borderStrong: "rgba(255, 255, 255, 0.18)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "orange-glow": "0 0 28px -6px rgba(244, 119, 53, 0.45)",
        "orange-subtle": "0 0 16px -4px rgba(244, 119, 53, 0.22)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.65)",
        nav: "0 10px 40px -12px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-core":
          "radial-gradient(circle at 50% 0%, rgba(244, 119, 53, 0.14) 0%, rgba(8, 8, 8, 0) 65%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.18s ease-out both",
        marquee: "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
