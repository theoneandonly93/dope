/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dope: {
          primary: "#00ffb2",
          secondary: "#8b5cf6",
          accent: "#00ffb2",
          neutral: "#0b0f13",
          "base-100": "#0b0f13",
          info: "#93c5fd",
          success: "#34d399",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: "dope",
  },
};
