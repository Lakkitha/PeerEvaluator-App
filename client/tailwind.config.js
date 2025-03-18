/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        darkmode: {
          50: "#f8fafc", // Very light gray for subtle highlights
          100: "#f1f5f9", // Light gray for hover states
          200: "#e2e8f0", // Light gray for borders
          300: "#cbd5e1", // Medium light gray
          400: "#94a3b8", // Medium gray for secondary content
          500: "#64748b", // Medium gray for text
          600: "#475569", // Dark gray for text
          700: "#334155", // Very dark gray for cards
          800: "#1e293b", // Dark background
          900: "#0f172a", // Very dark background
          950: "#020617", // Extremely dark background
        },
      },
      backgroundColor: {
        "card-dark": "var(--card-background)",
        "body-dark": "var(--background-color)",
      },
      textColor: {
        "primary-dark": "var(--text-color)",
        "secondary-dark": "var(--text-secondary)",
      },
      borderColor: {
        dark: "var(--border-color)",
      },
    },
  },
  plugins: [
    // Add typogaphy plugin for better text rendering if needed
    // require('@tailwindcss/typography'),
  ],
};
