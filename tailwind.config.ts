import type { Config } from "tailwindcss";

const config: Config = {
  // Use classic class-based dark mode (`.dark` on a parent)
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@shadow-shard-tools/docs-core/dist/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
