import {
    ArrowRight,
    BookOpen,
    ChartNoAxesColumn,
    Clock3,
    Mic,
    MessageCircle,
    Sparkles,
} from "lucide-react";

import { Link } from "react-router";

import { useAuth } from "../features/auth/useAuth";
import { useProgressSummary } from "../features/progress/hooks/useProgressSummary";

function formatDuration(seconds: number) {
    if (seconds === 0) return "0 мин";

    if (seconds < 3600) {
        return `${Math.ceil(seconds / 60)} мин`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return minutes > 0
        ? `${hours} ч ${minutes} мин`
        : `${hours} ч`;
}

const quickActions = [
    {
        title: "Тренировка дикции",
        description: "Скороговорки и чёткость произношения",
        href: "/diction",
        icon: Mic,
    },
    {
        title: "Словарный запас",
        description: "Изучай новые слова каждый день",
        href: "/vocabulary",
        icon: BookOpen,
    },
    {
        title: "Свободная речь",
        description: "Развивай уверенность в выступлениях",
        href: "/speaking",
        icon: MessageCircle,
    },
];

export default function DashboardPage() {
    const { user } = useAuth();

    const {
        summary,
        loading,
        error,
        reload,
    } = useProgressSummary();

    const totals = summary?.totals;

    const stats = [
        {
            title: "Тренировок",
            value: totals?.totalSessions ?? 0,
            icon: Mic,
        },
        {
            title: "Изучено слов",
            value: totals?.learnedWords ?? 0,
            icon: BookOpen,
        },
        {
            title: "Время практики",
            value: formatDuration(
                totals?.totalTrainingSeconds ?? 0,
            ),
            icon: Clock3,
        },
        {
            title: "Средняя оценка",
            value:
                totals?.averageSpeakingRating == null
                    ? "—"
                    : `${totals.averageSpeakingRating}/5`,
            icon: ChartNoAxesColumn,
        },
    ];

    const activity = summary?.activity ?? [];

    const maxActivity = Math.max(
        1,
        ...activity.map(
            (day) => day.diction + day.speaking + day.words,
        ),
    );

    return (
        <div className="space-y-7">
            {/* Приветствие */}
            <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <Sparkles size={18} />
                    Личный кабинет
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Привет, {user?.name || "друг"}!
                </h1>

                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Каждый день — возможность говорить лучше.
                    Продолжай тренировки и следи за своим прогрессом.
                </p>
            </section>

            {loading && (
                <p className="text-sm text-gray-500">
                    Загружаем твою статистику...
                </p>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-500/20 dark:bg-[#151725]">
                    <p role="alert" className="text-sm text-red-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void reload()}
                        className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {/* Статистика */}
            {!loading && !error && summary && (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.title}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]"
                                >
                                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </span>

                                        <Icon
                                            size={20}
                                            className="text-violet-600 dark:text-violet-300"
                                        />
                                    </div>

                                    <p className="mt-5 text-3xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Недельная активность */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold">
                                Активность за неделю
                            </h2>

                            <Link
                                to="/progress"
                                className="flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-300"
                            >
                                Вся статистика
                                <ArrowRight size={17} />
                            </Link>
                        </div>

                        <div className="mt-7 grid h-44 grid-cols-7 items-end gap-3">
                            {activity.map((day) => {
                                const count =
                                    day.diction + day.speaking + day.words;

                                const height =
                                    count > 0
                                        ? Math.max(8, (count / maxActivity) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={day.date}
                                        className="flex h-full flex-col items-center justify-end gap-2"
                                    >
                    <span className="text-xs font-semibold text-gray-500">
                      {count}
                    </span>

                                        <div className="flex h-28 w-full max-w-12 items-end overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10">
                                            <div
                                                title={`${count} действий`}
                                                className="w-full rounded-lg bg-violet-600 transition-all"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>

                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(
                          `${day.date}T12:00:00Z`,
                      ).toLocaleDateString("ru-RU", {
                          weekday: "short",
                          timeZone: "UTC",
                      })}
                    </span>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Учитываются занятия дикцией, выступления
                            и впервые изученные слова.
                        </p>
                    </section>
                </>
            )}

            {/* Быстрые действия */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    Продолжить обучение
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.href}
                                to={action.href}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-violet-400 dark:border-white/10 dark:bg-[#151725]"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                                    <Icon size={22} />
                                </div>

                                <h3 className="mt-5 font-semibold">
                                    {action.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    {action.description}
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-300">
                                    Начать
                                    <ArrowRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
