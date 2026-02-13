"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log("Toggle button clicked! Current theme:", theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all group"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-orange-500 transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-yellow-500 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;
