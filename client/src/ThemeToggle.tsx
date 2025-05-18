// filepath: d:\lakkitha\Github\PeerEvaluator-App\client\src\ThemeToggle.tsx
import { useEffect, useState, useCallback } from "react";

interface ThemeToggleProps {
  className?: string; // Allow custom styling from parent components
}

// Create a type for themes to avoid string literals
type Theme = "dark" | "light" | "system";

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is currently active
  const checkIsDarkMode = useCallback(() => {
    return document.documentElement.classList.contains("dark");
  }, []);

  // Apply the selected theme
  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const root = document.documentElement;

      if (newTheme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (systemPrefersDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      setIsDarkMode(checkIsDarkMode());
    },
    [checkIsDarkMode]
  );

  // Initialize theme on component mount
  useEffect(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem("color-theme") as Theme | null;

    // Set the initial state based on the actual DOM state
    setIsDarkMode(checkIsDarkMode());

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setTheme("system");
      applyTheme("system");
    }
  }, [applyTheme, checkIsDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // Effect to update isDarkMode when the theme changes in the DOM
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkIsDarkMode());
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [checkIsDarkMode]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const isCurrentlyDark = checkIsDarkMode();
    const newTheme = isCurrentlyDark ? "light" : "dark";

    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("color-theme", newTheme);
  };

  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={toggleTheme}
      className={`text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
      focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
      rounded-lg text-sm p-2.5 transition-colors ${className}`}
      aria-label="Toggle Dark Mode"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon - shown in dark mode */}
      <svg
        aria-hidden="true"
        className={isDarkMode ? "w-5 h-5" : "hidden w-5 h-5"}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          fillRule="evenodd"
          clipRule="evenodd"
        ></path>
      </svg>

      {/* Moon icon - shown in light mode */}
      <svg
        aria-hidden="true"
        className={!isDarkMode ? "w-5 h-5" : "hidden w-5 h-5"}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>
    </button>
  );
};

export default ThemeToggle;
