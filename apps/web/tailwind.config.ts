import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        orbi: {
          purple:  "#7c6aff",
          teal:    "#00d4aa",
          dark:    "#0d0d14",
          surface: "#13131f",
          border:  "#1e1e2e",
          muted:   "#4a4a6a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
