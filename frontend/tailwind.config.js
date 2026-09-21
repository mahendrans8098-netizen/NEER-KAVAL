/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // NEERKAVAL Design System — Water/Safety theme
        primary: {
          DEFAULT: "#006494",
          hover: "#0b5177",
          active: "#0b3751",
          light: "#e0f2fe",
        },
        danger: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
          active: "#991b1b",
        },
        warning: {
          DEFAULT: "#f97316",
          hover: "#ea580c",
        },
        caution: {
          DEFAULT: "#eab308",
          hover: "#ca8a04",
        },
        safe: {
          DEFAULT: "#22a559",
          hover: "#16a34a",
        },
        surface: {
          DEFAULT: "#f8fafc",
          2: "#f1f5f9",
          offset: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        tamil: ["Noto Sans Tamil", "system-ui", "sans-serif"],
      },
      fontSize: {
        emergency: ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
