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
        nice: "#1570AC",
        wine: "#A1081F",
        fire: "#AE4202",
        sail: "#036C17",
        anthracite: "#3A3D42",
        signal: "#CC1E2B",
        ulm: "#7E8082",
        cobalt: "#1B48A0",
        "hub-amethyst": "#0D0630",
        "hub-teal": "#8BBEB2",
        "hub-ruby": "#852736",
        "hub-blue": "#414B9E",
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
