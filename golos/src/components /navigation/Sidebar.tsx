import { Link, NavLink } from "react-router";

import {
    LayoutDashboard,
    Mic,
    BookOpen,
    AudioLines,
    Bot,
    ChartNoAxesCombined,
    X,
    Target,
    CheckCircle2,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

import { useProgressSummary } from "../../features/progress/hooks/useProgressSummary";

type SidebarProps = {
    onClose: () => void;
};

type NavigationItem = {
    title: string;
    path: string;
    icon: LucideIcon;
};

const navigation: NavigationItem[] = [
    {
        title: "Главная",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Дикция",
        path: "/diction",
        icon: Mic,
    },
    {
        title: "Словарный запас",
        path: "/vocabulary",
        icon: BookOpen,
    },
    {
        title: "Свободная речь",
        path: "/speaking",
        icon: AudioLines,
    },
    {
        title: "ИИ-собеседник",
        path: "/ai-coach",
        icon: Bot,
    },
    {
        title: "Мой прогресс",
        path: "/progress",
        icon: ChartNoAxesCombined,
    },
];

const DAILY_GOAL_SECONDS = 20 * 60;

export default function Sidebar({
                                    onClose,
                                }: SidebarProps) {
    // Все данные теперь приходят из PostgreSQL
    const {
        summary,
        loading,
        error,
    } = useProgressSummary();

    const totalSessions =
        summary?.totals.totalSessions ?? 0;

    const learnedWords =
        summary?.totals.learnedWords ?? 0;

    // Сервер группирует активность по UTC.
    // Используем ту же дату для ежедневной цели.
    const todayKey = new Date()
        .toISOString()
        .slice(0, 10);

    const todayActivity = summary?.activity.find(
        (day) => day.date === todayKey,
    );

    const todaySeconds =
        todayActivity?.durationSeconds ?? 0;

    const todayMinutes = Math.floor(
        todaySeconds / 60,
    );

    const goalPercent = Math.min(
        100,
        (todaySeconds / DAILY_GOAL_SECONDS) * 100,
    );

    const goalCompleted =
        todaySeconds >= DAILY_GOAL_SECONDS;

    return (
        <div className="flex h-full flex-col px-4 py-6">
            {/* Logo */}
            <div className="mb-10 flex items-center justify-between px-3">
                <Link
                    to="/"
                    onClick={onClose}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
                        <AudioLines className="h-5 w-5 text-white" />
                    </div>

                    <span className="text-2xl font-bold tracking-tight">
            голос
            <span className="text-violet-600">
              .
            </span>
          </span>
                </Link>

                <button
                    type="button"
                    aria-label="Закрыть меню"
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Основная навигация"
                className="space-y-1"
            >
                {navigation.map(
                    ({ title, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/"}
                            onClick={onClose}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
                                )
                            }
                        >
                            <Icon
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>{title}</span>
                        </NavLink>
                    ),
                )}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto space-y-4 pt-6">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#151725]">
                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300">
                            <Mic size={16} />
                            <span className="text-xs font-medium">
                Тренировки
              </span>
                        </div>

                        <p className="mt-3 text-2xl font-bold">
                            {loading || error
                                ? "—"
                                : totalSessions}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#151725]">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <BookOpen size={16} />
                            <span className="text-xs font-medium">
                Слова
              </span>
                        </div>

                        <p className="mt-3 text-2xl font-bold">
                            {loading || error
                                ? "—"
                                : learnedWords}
                        </p>
                    </div>
                </div>

                {/* Daily goal */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                    <div className="flex items-center gap-2">
                        {goalCompleted && !error ? (
                            <CheckCircle2
                                size={17}
                                className="text-green-600 dark:text-green-400"
                            />
                        ) : (
                            <Target
                                size={17}
                                className="text-violet-600 dark:text-violet-300"
                            />
                        )}

                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                            Ежедневная цель
                        </p>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold">
                        20 минут в день
                    </h3>

                    {loading ? (
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Загружаем прогресс...
                        </p>
                    ) : error ? (
                        <p className="mt-4 text-xs text-red-500">
                            Не удалось загрузить статистику.
                        </p>
                    ) : (
                        <>
                            <div
                                className="mt-4 h-2 overflow-hidden rounded-full bg-violet-200 dark:bg-violet-900"
                                role="progressbar"
                                aria-label="Ежедневная цель"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(goalPercent)}
                            >
                                <div
                                    className="h-full rounded-full bg-violet-600 transition-all duration-300"
                                    style={{
                                        width: `${goalPercent}%`,
                                    }}
                                />
                            </div>

                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                {todayMinutes} / 20 минут
                            </p>

                            {goalCompleted && (
                                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                                    <CheckCircle2 size={15} />
                                    Цель на сегодня достигнута!
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
