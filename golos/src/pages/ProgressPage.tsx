import {
    Activity,
    BookOpen,
    Clock3,
    Mic,
    MessageCircle,
    Star,
    TrendingUp,
} from "lucide-react";

import { useProgressSummary } from "../features/progress/hooks/useProgressSummary";

function formatDuration(seconds: number) {
    if (seconds <= 0) return "0 мин";

    if (seconds < 3600) {
        return `${Math.ceil(seconds / 60)} мин`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return minutes > 0
        ? `${hours} ч ${minutes} мин`
        : `${hours} ч`;
}

export default function ProgressPage() {
    const {
        summary,
        loading,
        error,
        reload,
    } = useProgressSummary();

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 dark:border-white/10 dark:bg-[#151725]">
                Загружаем твой прогресс...
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-8 dark:border-red-500/20 dark:bg-[#151725]">
                <p role="alert" className="text-sm text-red-500">
                    {error || "Не удалось получить статистику"}
                </p>

                <button
                    type="button"
                    onClick={() => void reload()}
                    className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
                >
                    Повторить
                </button>
            </div>
        );
    }

    const { totals, activity } = summary;

    const vocabularyPercent =
        totals.vocabularyWords > 0
            ? Math.round(
                (totals.learnedWords / totals.vocabularyWords) * 100,
            )
            : 0;

    const weekSessions = activity.reduce(
        (total, day) =>
            total + day.diction + day.speaking,
        0,
    );

    const weekWords = activity.reduce(
        (total, day) => total + day.words,
        0,
    );

    const weekSeconds = activity.reduce(
        (total, day) => total + day.durationSeconds,
        0,
    );

    const stats = [
        {
            title: "Всего тренировок",
            value: totals.totalSessions,
            icon: Activity,
        },
        {
            title: "Дикция",
            value: totals.dictionSessions,
            icon: Mic,
        },
        {
            title: "Свободная речь",
            value: totals.speakingSessions,
            icon: MessageCircle,
        },
        {
            title: "Изучено слов",
            value: totals.learnedWords,
            icon: BookOpen,
        },
        {
            title: "Общее время",
            value: formatDuration(totals.totalTrainingSeconds),
            icon: Clock3,
        },
        {
            title: "Средняя оценка речи",
            value:
                totals.averageSpeakingRating === null
                    ? "—"
                    : `${totals.averageSpeakingRating}/5`,
            icon: Star,
        },
    ];

    return (
        <div className="space-y-7">
            {/* Заголовок */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <TrendingUp size={18} />
                    Аналитика обучения
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Мой прогресс
                </h1>

                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Все твои результаты, достижения и активность
                    в одном месте.
                </p>
            </div>

            {/* Общие показатели */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {stat.title}
                                </p>

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
            </section>

            {/* Изученные слова */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">
                            Словарный запас
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {totals.learnedWords} из{" "}
                            {totals.vocabularyWords} слов изучено
                        </p>
                    </div>

                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-300">
            {vocabularyPercent}%
          </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                        className="h-full rounded-full bg-violet-600 transition-all"
                        style={{
                            width: `${vocabularyPercent}%`,
                        }}
                    />
                </div>
            </section>

            {/* Неделя */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                <h2 className="text-lg font-bold">
                    За последние 7 дней
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-gray-50 p-5 dark:bg-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Тренировок
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {weekSessions}
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-5 dark:bg-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Изученных слов
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {weekWords}
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-5 dark:bg-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Время практики
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {formatDuration(weekSeconds)}
                        </p>
                    </div>
                </div>
            </section>

            {/* Таблица активности */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                <h2 className="text-lg font-bold">
                    История активности за неделю
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Данные загружаются из твоего аккаунта.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-140 text-left text-sm">
                        <thead>
                        <tr className="border-b border-gray-200 text-gray-500 dark:border-white/10 dark:text-gray-400">
                            <th className="py-3 pr-4 font-medium">
                                Дата
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Дикция
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Выступления
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Слова
                            </th>
                            <th className="py-3 pl-4 font-medium">
                                Время
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {activity.map((day) => (
                            <tr
                                key={day.date}
                                className="border-b border-gray-100 last:border-0 dark:border-white/10"
                            >
                                <td className="py-4 pr-4 font-medium">
                                    {new Date(
                                        `${day.date}T12:00:00Z`,
                                    ).toLocaleDateString("ru-RU", {
                                        day: "numeric",
                                        month: "short",
                                        timeZone: "UTC",
                                    })}
                                </td>

                                <td className="px-4 py-4">
                                    {day.diction}
                                </td>

                                <td className="px-4 py-4">
                                    {day.speaking}
                                </td>

                                <td className="px-4 py-4">
                                    {day.words}
                                </td>

                                <td className="py-4 pl-4">
                                    {formatDuration(day.durationSeconds)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
