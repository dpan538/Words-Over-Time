import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050510",
        wheat: "#F5ECD2",
        blaze: "#F06B04",
        sun: "#FBB728",
        curious: "#2C9FC7",
        nice: "#1570AC",
        wine: "#A1081F",
        mango: "#E87305",
        fire: "#AE4202",
        alien: "#5FCA00",
        sail: "#036C17",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
