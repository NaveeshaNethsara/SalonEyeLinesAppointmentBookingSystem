import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FAF7F2",
          100: "#F4ECE1",
          200: "#EFE4D6",
          300: "#E5D4BF",
        },
        gold: {
          light: "#EFE4D6",
          primary: "#D7BF9F",
          hover: "#C5A880",
          deep: "#8F6B38", // calibrated for WCAG AA 4.5:1+ contrast on ivory/white backgrounds
          dark: "#6E5028",
        },
        espresso: {
          800: "#2B2825",
          900: "#1E1B18",
          950: "#141210",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
      boxShadow: {
        gold: "0 10px 30px rgba(215, 191, 159, 0.3)",
        card: "0 10px 30px rgba(43, 40, 37, 0.07)",
        "card-hover": "0 22px 45px -12px rgba(180, 144, 100, 0.22)",
        "gold-glow": "0 0 30px rgba(215, 191, 159, 0.45)",
      },
      animation: {
        "float-slow": "floatSlow 5s ease-in-out infinite",
        "float-reverse": "floatReverse 6.5s ease-in-out infinite",
        "pulse-gentle": "pulseGentle 3.5s ease-in-out infinite",
        "shimmer": "shimmer 3s infinite linear",
        "reveal-up": "revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-pop": "scalePop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "spin-slow": "spin 25s linear infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1.5deg)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(8px) rotate(-1.5deg)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        revealUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scalePop: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
