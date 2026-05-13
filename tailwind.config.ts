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
        "hub-amethyst": "#0D0630",
        "hub-teal": "#8BBEB2",
        "hub-lime": "#E6F9AF",
        "hub-ruby": "#852736",
        "hub-blue": "#414B9E",
        "hub-ceil": "#9792CB",
        "hub-pearly": "#AA74A0",
        "hub-gold": "#CAAC4B",
        "hub-space": "#18314F",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
