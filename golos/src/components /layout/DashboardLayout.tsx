import { useState } from "react";
import { Outlet } from "react-router";
import { Menu, UserRound, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../features/auth/useAuth";

import Sidebar from "../navigation/Sidebar";
import ThemeToggle from "../../features/theme/ThemeToggle.tsx";

export default function DashboardLayout() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const { user, logout } = useAuth();

    const [logoutError, setLogoutError] = useState("");

    async function handleLogout() {
        setLogoutError("");

        try {
            await logout();
        } catch {
            setLogoutError("Не удалось выйти. Проверь соединение с сервером.");
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD] text-[#20243A] transition-colors dark:bg-[#0B0D17] dark:text-[#F5F3FF] lg:flex">
            {/* Mobile overlay */}
            {menuOpen && (
                <button
                    type="button"
                    aria-label="Закрыть боковое меню"
                    onClick={closeMenu}
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                id="app-sidebar"
                className={clsx(
                    "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-[#10121E]",
                    "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar onClose={closeMenu} />
            </aside>

            {/* Main area */}
            <div className="min-w-0 flex-1">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#10121E]/90 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Открыть меню"
                            aria-controls="app-sidebar"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(true)}
                            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Платформа развития речи
            </span>
                    </div>


                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <div className="hidden text-right sm:block">
                            <p className="max-w-40 truncate text-sm font-semibold">
                                {user?.name || "Пользователь"}
                            </p>

                            <p className="max-w-40 truncate text-xs text-gray-500 dark:text-gray-400">
                                {user?.email}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                            <UserRound size={19} />
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            title="Выйти из аккаунта"
                            aria-label="Выйти из аккаунта"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10"
                        >
                            <LogOut size={19} />
                        </button>

                        {logoutError && (
                            <p role="alert" className="max-w-40 text-xs text-red-500">
                                {logoutError}
                            </p>
                        )}
                    </div>

                </header>

                {/* Page content */}
                <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
