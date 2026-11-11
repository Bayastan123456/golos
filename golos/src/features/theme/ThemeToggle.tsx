import { Moon, Sun } from "lucide-react";

import { useTheme } from "./useTheme";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                isDark
                    ? "Включить светлую тему"
                    : "Включить тёмную тему"
            }
            aria-pressed={isDark}
            title={
                isDark ? "Светлая тема" : "Тёмная тема"
            }
            className="
        flex h-10 w-10 items-center justify-center
        rounded-xl border border-gray-200
        bg-white text-gray-700
        transition-colors duration-200
        hover:bg-violet-50 hover:text-violet-600
        dark:border-white/10
        dark:bg-[#151725] dark:text-gray-200
        dark:hover:bg-[#29243D]
        dark:hover:text-violet-300
      "
        >
            {isDark ? (
                <Sun size={20} strokeWidth={1.8} />
            ) : (
                <Moon size={20} strokeWidth={1.8} />
            )}
        </button>
    );
}
