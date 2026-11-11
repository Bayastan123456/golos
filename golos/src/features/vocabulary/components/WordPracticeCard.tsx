import { BookOpen, CheckCircle2, Eye, EyeOff } from "lucide-react";

import type {
    VocabularyWord,
    WordProgress,
} from "../types";

interface WordPracticeCardProps {
    word: VocabularyWord;
    progress?: WordProgress;
    revealed: boolean;
    onToggleReveal: () => void;
    onSentenceChange: (value: string) => void;
    onToggleLearned: () => void;
}

export default function WordPracticeCard({
                                             word,
                                             progress,
                                             revealed,
                                             onToggleReveal,
                                             onSentenceChange,
                                             onToggleLearned,
                                         }: WordPracticeCardProps) {
    const sentence = progress?.sentence ?? "";
    const learned = progress?.learned ?? false;
    const canComplete = sentence.trim().length >= 12;

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725] sm:p-8">
            <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          СЛОВО ДНЯ
        </span>

                <BookOpen className="text-violet-500" size={21} />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                {word.word}
            </h2>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Попробуй самостоятельно объяснить это слово.
                Затем открой определение и проверь себя.
            </p>

            <button
                type="button"
                onClick={onToggleReveal}
                aria-expanded={revealed}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-600 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
                {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
                {revealed ? "Скрыть значение" : "Показать значение"}
            </button>

            {revealed && (
                <div className="mt-5 space-y-4 rounded-xl bg-violet-50 p-5 dark:bg-violet-500/10">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                            Значение
                        </p>
                        <p className="mt-2 text-sm leading-7">
                            {word.meaning}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                            Пример
                        </p>
                        <p className="mt-2 text-sm italic leading-7">
                            «{word.example}»
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <label
                    htmlFor={`sentence-${word.id}`}
                    className="block text-base font-semibold"
                >
                    Составь своё предложение
                </label>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Используй новое слово в ситуации из своей жизни,
                    работы или общения.
                </p>

                <textarea
                    id={`sentence-${word.id}`}
                    value={sentence}
                    onChange={(event) =>
                        onSentenceChange(event.target.value)
                    }
                    placeholder={`Напиши предложение со словом «${word.word}»...`}
                    rows={4}
                    className="mt-4 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 outline-none transition-colors placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Предложение сохраняется автоматически.
                </p>
            </div>

            <button
                type="button"
                onClick={onToggleLearned}
                disabled={!learned && !canComplete}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <CheckCircle2 size={19} />
                {learned
                    ? "Вернуть на повторение"
                    : "Я изучил это слово"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
                Отметка основана на твоей самооценке.
                Автоматической проверки смысла пока нет.
            </p>
        </section>
    );
}
