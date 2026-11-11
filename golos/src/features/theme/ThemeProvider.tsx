import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ThemeContext } from "./theme-context";
import type { Theme } from "./theme.types";

interface ThemeProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = "golos-theme";

function getInitialTheme(): Theme {
    try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);

        return savedTheme === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

export default function ThemeProvider({
                                          children,
                                      }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;

        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;

        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Сайт продолжит работать без сохранения темы.
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) =>
            current === "light" ? "dark" : "light"
        );
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
