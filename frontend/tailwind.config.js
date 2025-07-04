/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        newsdark: {
          primary: "#F8FAFC", // Bright white for main text and active buttons
          secondary: "#94A3B8", // Softer slate for secondary buttons and body text
          accent: "#F59E0B", // Vibrant amber for highlights (badges, toggles)
          neutral: "#1E293B", // Slate background for cards
          "base-100": "#0F172A", // Deep navy background
          info: "#38BDF8", // Light blue for info alerts
          success: "#4ADE80", // Green for success messages
          warning: "#FBBF24", // Yellow for warnings
          error: "#F87171", // Red for errors
        },
      },
      {
        newslight: {
          primary: "#0F172A", // Deep navy for main text and active buttons
          secondary: "#64748B", // Soft slate for secondary elements
          accent: "#F59E0B", // Amber for badges, toggles
          neutral: "#FFFFFF", // Light slate-gray for cards
          "base-100":"#F1F5F9" , // White background
          info: "#0EA5E9", // Bright blue for info
          success: "#22C55E", // Bright green for success
          warning: "#EAB308", // Yellow/gold for warnings
          error: "#DC2626", // Strong red for errors
        },
      },
    ],
  },
};
