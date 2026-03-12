export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 600: "#0284c7", 700: "#0369a1", 900: "#0c4a6e" },
        success: { 500: "#22c55e", 700: "#15803d" },
        warning: { 500: "#f59e0b" },
        error: { 500: "#ef4444" }
      }
    }
  },
  plugins: []
};
