import { useMemo, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    Check,
    CheckCircle2,
    CircleCheck,
    GraduationCap,
    Lightbulb,
    Save,
    Sparkles,
} from "lucide-react";

import {
    type VocabularyWord,
    type WordLevel,
    type WordProgress,
} from "../features/vocabulary/api/vocabularyApi";

import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";

const levelLabels: Record<WordLevel, string> = {
    EASY: "Лёгкий",
    MEDIUM: "Средний",
    HARD: "Сложный",
};

interface WordCardProps {
    word: VocabularyWord;
    progress?: WordProgress;
    saving: boolean;
    busy: boolean;
    onSave: (
        wordId: string,
        sentence: string,
        learned: boolean,
    ) => Promise<WordProgress>;
}

function WordCard({
                      word,
                      progress,
                      saving,
                      busy,
                      onSave,
                  }: WordCardProps) {
    const [sentence, setSentence] = useState(
        progress?.sentence ?? "",
    );

    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const isLearned = progress?.learned ?? false;

    async function handleSave(learned: boolean) {
        if (busy) return;

        const preparedSentence = sentence.trim();

        if (learned && preparedSentence.length < 12) {
            setFeedback({
                type: "error",
                message:
                    "Напиши предложение минимум из 12 символов.",
            });
            return;
        }

        setFeedback(null);

        try {
            await onSave(
                word.id,
                preparedSentence,
                learned,
            );

            setSentence(preparedSentence);

            setFeedback({
                type: "success",
                message: learned
                    ? "Слово отмечено как изученное!"
                    : "Изменения сохранены.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Не удалось сохранить слово",
            });
        }
    }

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
          <span className="text-xs font-medium text-violet-600 dark:text-violet-300">
            {levelLabels[word.level]}
          </span>

                    <h3 className="mt-2 text-2xl font-bold">
                        {word.word}
                    </h3>
                </div>

                {isLearned ? (
                    <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
            <CheckCircle2 size={15} />
            Изучено
          </span>
                ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-300">
            В изучении
          </span>
                )}
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {word.meaning}
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-violet-50 p-4 dark:bg-violet-500/10">
                <Lightbulb
                    size={19}
                    className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-300"
                />

                <div>
                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                        Пример использования
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                        {word.example}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <label
                    htmlFor={`sentence-${word.id}`}
                    className="block text-sm font-semibold"
                >
                    Составь своё предложение
                </label>

                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Используй новое слово в собственном предложении,
                    чтобы лучше его запомнить.
                </p>

                <textarea
                    id={`sentence-${word.id}`}
                    value={sentence}
                    maxLength={1000}
                    onChange={(event) => {
                        setSentence(event.target.value);
                        setFeedback(null);
                    }}
                    rows={3}
                    placeholder={`Придумай предложение со словом «${word.word}»...`}
                    className="mt-4 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 outline-none transition-colors placeholder:text-gray-400 focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                />
            </div>

            {feedback && (
                <p
                    role="status"
                    className={`mt-3 text-sm ${
                        feedback.type === "error"
                            ? "text-red-500"
                            : "text-green-600 dark:text-green-400"
                    }`}
                >
                    {feedback.message}
                </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSave(isLearned)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                    <Save size={17} />
                    {saving ? "Сохранение..." : "Сохранить предложение"}
                </button>

                <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSave(!isLearned)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isLearned
                            ? "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                            : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                >
                    {isLearned ? (
                        <>
                            <BookOpen size={17} />
                            Вернуть к изучению
                        </>
                    ) : (
                        <>
                            <Check size={17} />
                            Отметить изученным
                        </>
                    )}
                </button>
            </div>
        </article>
    );
}

export default function VocabularyPage() {
    const {
        words,
        progressByWordId,
        loading,
        error,
        savingWordId,
        saveProgress,
        reload,
    } = useVocabulary();

    const [showAll, setShowAll] = useState(false);

    // Формируем 5 слов дня из серверного каталога.
    // При наличии более 5 слов набор меняется по дням.
    const todayWords = useMemo(() => {
        if (words.length <= 5) return words;

        const today = new Date();

        const dayNumber = Math.floor(
            Date.UTC(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            ) / 86_400_000,
        );

        const start = (dayNumber * 5) % words.length;

        return Array.from(
            { length: 5 },
            (_, index) => words[(start + index) % words.length],
        );
    }, [words]);

    const visibleWords = showAll ? words : todayWords;

    const learnedTotal = Object.values(
        progressByWordId,
    ).filter((item) => item.learned).length;

    const todayLearned = todayWords.filter(
        (word) => progressByWordId[word.id]?.learned,
    ).length;

    const dateLabel = new Date().toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
        },
    );

    return (
        <div className="space-y-7">
            {/* Заголовок страницы */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <BookOpen size={18} />
                    Развитие словарного запаса
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Словарный запас
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Изучай новые слова, узнавай их значение
                    и учись использовать их в повседневной речи.
                </p>
            </div>

            {/* Статистика */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                    <div className="flex items-center gap-3">
                        <BookOpen
                            size={20}
                            className="text-violet-600"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Всего слов
                        </p>
                    </div>

                    <p className="mt-4 text-3xl font-bold">
                        {words.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                    <div className="flex items-center gap-3">
                        <CircleCheck
                            size={20}
                            className="text-green-600"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Изучено слов
                        </p>
                    </div>

                    <p className="mt-4 text-3xl font-bold">
                        {learnedTotal}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                    <div className="flex items-center gap-3">
                        <GraduationCap
                            size={20}
                            className="text-amber-500"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Прогресс набора дня
                        </p>
                    </div>

                    <p className="mt-4 text-3xl font-bold">
                        {todayLearned}/{todayWords.length}
                    </p>
                </div>
            </div>

            {/* Прогресс слов дня */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-300">
                            <CalendarDays size={18} />
                            {dateLabel}
                        </div>

                        <h2 className="mt-2 text-xl font-bold">
                            Твой прогресс
                        </h2>
                    </div>

                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">
            {todayWords.length > 0
                ? Math.round(
                    (todayLearned / todayWords.length) * 100,
                )
                : 0}
                        %
          </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                        className="h-full rounded-full bg-violet-600 transition-all duration-300"
                        style={{
                            width: `${
                                todayWords.length > 0
                                    ? (todayLearned / todayWords.length) * 100
                                    : 0
                            }%`,
                        }}
                    />
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {todayLearned === todayWords.length &&
                    todayWords.length > 0
                        ? "Отлично! Все слова этого набора изучены."
                        : "Составляй предложения и отмечай изученные слова."}
                </p>
            </section>

            {/* Список слов */}
            <section>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles
                                size={20}
                                className="text-violet-600"
                            />

                            <h2 className="text-xl font-bold">
                                {showAll ? "Весь словарь" : "Пять слов дня"}
                            </h2>
                        </div>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {showAll
                                ? "Все доступные слова из PostgreSQL"
                                : "Тренируйся каждый день и расширяй словарный запас."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAll((previous) => !previous)
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        {showAll ? "Слова дня" : "Показать все слова"}
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-[#151725]">
                        Загружаем слова из PostgreSQL...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-500/20 dark:bg-[#151725]">
                        <p role="alert" className="text-sm text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => void reload()}
                            className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Повторить загрузку
                        </button>
                    </div>
                ) : visibleWords.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#151725]">
                        <BookOpen
                            size={32}
                            className="mx-auto text-gray-400"
                        />

                        <p className="mt-4 font-semibold">
                            В словаре пока нет слов
                        </p>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Добавь первые слова через Prisma Seed.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {visibleWords.map((word) => (
                            <WordCard
                                key={word.id}
                                word={word}
                                progress={progressByWordId[word.id]}
                                saving={savingWordId === word.id}
                                busy={savingWordId !== null}
                                onSave={saveProgress}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
