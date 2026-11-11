import { useState } from "react";
import { BookOpen, CheckCircle2, Lightbulb, Mic } from "lucide-react";
import clsx from "clsx";

import {
    tongueTwisters,
    type Difficulty,
} from "../features/diction/data/tongueTwisters";

import { useVoiceRecorder } from "../features/diction/hooks/useVoiceRecorder";
import { useDictionHistory } from "../features/diction/hooks/useDictionHistory";
import RecorderPanel from "../features/diction/components/RecorderPanel";

const levels: {
    id: Difficulty;
    label: string;
}[] = [
    { id: "easy", label: "Лёгкий" },
    { id: "medium", label: "Средний" },
    { id: "hard", label: "Сложный" },
];

export default function DictionPage() {
    const [difficulty, setDifficulty] =
        useState<Difficulty>("easy");

    const [selectedId, setSelectedId] =
        useState("easy-1");

    const recorder = useVoiceRecorder();
    const history = useDictionHistory();

    const [saving, setSaving] = useState(false);

    const [savedAudioUrl, setSavedAudioUrl] =
        useState<string | null>(null);

    const [saveError, setSaveError] = useState("");

    const isSaved =
        Boolean(recorder.audioUrl) &&
        savedAudioUrl === recorder.audioUrl;

    const exercises = tongueTwisters.filter(
        (item) => item.difficulty === difficulty
    );

    const selectedExercise =
        tongueTwisters.find((item) => item.id === selectedId) ??
        tongueTwisters[0];

    const selectionDisabled =
        recorder.status !== "idle" || saving;

    function changeDifficulty(value: Difficulty) {
        if (selectionDisabled) return;

        setDifficulty(value);

        const firstExercise = tongueTwisters.find(
            (item) => item.difficulty === value
        );

        if (firstExercise) {
            setSelectedId(firstExercise.id);
        }

        recorder.resetRecording();
    }

    function selectExercise(id: string) {
        if (selectionDisabled) return;

        setSelectedId(id);
        recorder.resetRecording();
    }
    async function handleSaveDiction() {
        if (
            !recorder.audioUrl ||
            isSaved ||
            saving ||
            recorder.status !== "idle"
        ) {
            return;
        }

        if (recorder.seconds < 1) {
            setSaveError("Запиши хотя бы одну секунду.");
            return;
        }

        setSaving(true);
        setSaveError("");

        const currentAudioUrl = recorder.audioUrl;

        try {
            await history.saveSession({
                exerciseId: selectedExercise.id,
                exerciseTitle: selectedExercise.title,
                durationSeconds: recorder.seconds,
            });

            setSavedAudioUrl(currentAudioUrl);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Не удалось сохранить тренировку",
            );
        } finally {
            setSaving(false);
        }
    }




    return (
        <div className="space-y-7">
            {/* Page heading */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <Mic size={18} />
                    Тренировка речи
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Развитие дикции
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Тренируй произношение с помощью скороговорок.
                    Записывай голос, прослушивай себя и постепенно
                    улучшай чёткость речи.
                </p>
            </div>

            {/* Levels */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Выбери сложность
                </h2>

                <div className="flex flex-wrap gap-3">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            type="button"
                            disabled={selectionDisabled}
                            aria-pressed={difficulty === level.id}
                            onClick={() => changeDifficulty(level.id)}
                            className={clsx(
                                "rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                difficulty === level.id
                                    ? "border-violet-600 bg-violet-600 text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 dark:border-white/10 dark:bg-[#151725] dark:text-gray-300"
                            )}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Left column */}
                <div className="space-y-6">
                    {/* Current exercise */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725] sm:p-8">
                        <div className="mb-6 flex items-center justify-between gap-3">
              <span className="rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {levels.find(
                    (level) => level.id === difficulty
                )?.label}{" "}
                  уровень
              </span>

                            <BookOpen
                                size={20}
                                className="text-gray-400"
                            />
                        </div>

                        <h2 className="text-xl font-bold">
                            {selectedExercise.title}
                        </h2>

                        <p className="mt-6 rounded-xl bg-violet-50 p-5 text-xl font-medium leading-relaxed text-gray-900 dark:bg-violet-500/10 dark:text-gray-100 sm:text-2xl">
                            {selectedExercise.text}
                        </p>

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                            <Lightbulb
                                size={20}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <p className="text-sm leading-6 text-amber-900 dark:text-amber-200">
                                {selectedExercise.tip}
                            </p>
                        </div>
                    </section>

                    {/* Exercise catalog */}
                    <section>
                        <h2 className="mb-4 text-lg font-semibold">
                            Другие упражнения
                        </h2>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {exercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    type="button"
                                    disabled={selectionDisabled}
                                    aria-pressed={selectedId === exercise.id}
                                    onClick={() =>
                                        selectExercise(exercise.id)
                                    }
                                    className={clsx(
                                        "flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                        selectedId === exercise.id
                                            ? "border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-500/10"
                                            : "border-gray-200 bg-white hover:border-violet-300 dark:border-white/10 dark:bg-[#151725]"
                                    )}
                                >
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {exercise.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Практика произношения
                                        </p>
                                    </div>

                                    {selectedId === exercise.id && (
                                        <CheckCircle2
                                            size={20}
                                            className="shrink-0 text-violet-600"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right column */}

                <div className="space-y-4 xl:sticky xl:top-24">
                    <RecorderPanel recorder={recorder} disabledStart={saving}/>

                    {recorder.audioUrl && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                            <h3 className="font-semibold">
                                Результат упражнения
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Прослушай запись. Если доволен своей практикой,
                                сохрани результат в статистике.
                            </p>


                            <button
                                type="button"
                                disabled={isSaved || saving}
                                onClick={() => void handleSaveDiction()}
                                className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Сохранение..."
                                    : isSaved
                                        ? "Тренировка сохранена ✓"
                                        : "Сохранить тренировку"}
                            </button>


                            {saveError && (
                                <p role="alert" className="mt-3 text-sm text-red-500">
                                    {saveError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                <h2 className="text-xl font-bold">
                    История тренировок дикции
                </h2>

                {history.loading ? (
                    <p className="mt-4 text-sm text-gray-500">
                        Загружаем тренировки...
                    </p>
                ) : history.error ? (
                    <p role="alert" className="mt-4 text-sm text-red-500">
                        {history.error}
                    </p>
                ) : history.sessions.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">
                        Пока нет сохранённых тренировок.
                    </p>
                ) : (
                    <div className="mt-5 divide-y divide-gray-100 dark:divide-white/10">
                        {history.sessions.slice(0, 5).map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between gap-3 py-4"
                            >
                                <div>
                                    <p className="text-sm font-semibold">
                                        {session.exerciseTitle}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {new Date(session.createdAt).toLocaleString(
                                            "ru-RU",
                                        )}
                                    </p>
                                </div>

                                <span className="text-sm font-medium text-violet-600 dark:text-violet-300">
            {session.durationSeconds} сек.
          </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}
