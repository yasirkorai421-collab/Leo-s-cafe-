import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        heading: ["var(--font-baloo)", "sans-serif"],
        script: ["var(--font-alex)", "cursive"],
      },
      colors: {
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
        },
        black: "var(--color-black)",
        heading: "var(--color-heading)",
        "body-gray": "var(--color-body-gray)",
        "label-gray": "var(--color-label-gray)",
        "border-light": "var(--color-border-light)",
        white: "var(--color-white)",
        "bg-page": "var(--bg-page)",
        "bg-section-alt": "var(--bg-section-alt)",
        "bg-tab-inactive": "var(--bg-tab-inactive)",
        "bg-dark-panel": "var(--bg-dark-panel)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
