import { useEffect, useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Lightbulb,
    MessageCircle,
    Mic,
    RotateCcw,
    Sparkles,
    Star,
} from "lucide-react";

import RecorderPanel from "../features/diction/components/RecorderPanel";
import { useVoiceRecorder } from "../features/diction/hooks/useVoiceRecorder";
import { useSpeakingHistory } from "../features/speaking/hooks/useSpeakingHistory";

type PrepPhase = "idle" | "preparing" | "ready";
type GoalSeconds = 120 | 180 | 300;

interface SpeakingTopic {
    id: string;
    title: string;
    description: string;
    hint: string;
}

const PREPARATION_SECONDS = 30;

const GOALS: { value: GoalSeconds; label: string }[] = [
    { value: 120, label: "2 минуты" },
    { value: 180, label: "3 минуты" },
    { value: 300, label: "5 минут" },
];

const TOPICS: SpeakingTopic[] = [
    {
        id: "about-me",
        title: "Расскажи о себе",
        description:
            "Расскажи, кто ты, чем занимаешься и чего хочешь достичь.",
        hint: "Начни с представления, затем расскажи об интересах и целях.",
    },
    {
        id: "dream",
        title: "Моя главная мечта",
        description:
            "Расскажи о своей мечте и о том, почему она для тебя важна.",
        hint: "Объясни, к чему стремишься и какие шаги уже предпринимаешь.",
    },
    {
        id: "technology",
        title: "Технологии будущего",
        description:
            "Поделись мнением о том, как технологии изменят нашу жизнь.",
        hint: "Приведи примеры технологий, их преимуществ и возможных рисков.",
    },
    {
        id: "success",
        title: "Что такое успех?",
        description:
            "Объясни, что лично для тебя означает быть успешным.",
        hint: "Начни с определения, затем приведи пример из жизни.",
    },
    {
        id: "travel",
        title: "Путешествие мечты",
        description:
            "Расскажи, куда бы ты хотел отправиться и почему.",
        hint: "Опиши место, впечатления и то, чему хочешь научиться.",
    },
    {
        id: "challenge",
        title: "Как я преодолел трудность",
        description:
            "Вспомни сложную ситуацию и расскажи, как ты с ней справился.",
        hint: "Используй структуру: ситуация — действия — результат.",
    },
];

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remaining,
    ).padStart(2, "0")}`;
}

export default function SpeakingPage() {
    const recorder = useVoiceRecorder();
    const history = useSpeakingHistory();

    // Настройки упражнения
    const [selectedTopicId, setSelectedTopicId] =
        useState<string>(TOPICS[0].id);

    const [goalSeconds, setGoalSeconds] =
        useState<GoalSeconds>(120);

    // Подготовка
    const [prepPhase, setPrepPhase] =
        useState<PrepPhase>("idle");

    const [prepSeconds, setPrepSeconds] =
        useState(PREPARATION_SECONDS);

    // Самооценка
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState("");

    // Сохранение
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const [savedAudioUrl, setSavedAudioUrl] =
        useState<string | null>(null);

    const selectedTopic =
        TOPICS.find((topic) => topic.id === selectedTopicId) ??
        TOPICS[0];

    const recorderBusy = recorder.status !== "idle";

    const hasRecording = Boolean(recorder.audioUrl);

    const isSaved =
        hasRecording &&
        savedAudioUrl === recorder.audioUrl;

    const canChangeSettings =
        !recorderBusy &&
        !hasRecording &&
        !saving &&
        prepPhase !== "preparing";

    // Обратный отсчёт подготовки
    useEffect(() => {
        if (prepPhase !== "preparing") return;

        const timer = window.setTimeout(() => {
            const remaining = Math.max(0, prepSeconds - 1);
            setPrepSeconds(remaining);
            if (remaining === 0) setPrepPhase("ready");
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [prepPhase, prepSeconds]);

    function startPreparation() {
        if (recorderBusy || hasRecording || saving) return;

        setPrepSeconds(PREPARATION_SECONDS);
        setPrepPhase("preparing");
        setSaveError("");
    }

    function skipPreparation() {
        setPrepSeconds(0);
        setPrepPhase("ready");
    }

    function changeTopic(topicId: string) {
        if (!canChangeSettings) return;

        setSelectedTopicId(topicId);
        setPrepPhase("idle");
        setPrepSeconds(PREPARATION_SECONDS);
        setRating(0);
        setNote("");
        setSaveError("");
        setSavedAudioUrl(null);

        recorder.resetRecording();
    }

    function changeGoal(value: GoalSeconds) {
        if (!canChangeSettings) return;

        setGoalSeconds(value);
        setPrepPhase("idle");
        setPrepSeconds(PREPARATION_SECONDS);
    }

    function resetAttempt() {
        if (recorderBusy || saving) return;

        recorder.resetRecording();

        setPrepPhase("idle");
        setPrepSeconds(PREPARATION_SECONDS);
        setRating(0);
        setNote("");
        setSavedAudioUrl(null);
        setSaveError("");
    }

    async function saveResult() {
        if (
            !recorder.audioUrl ||
            !rating ||
            isSaved ||
            recorderBusy ||
            saving
        ) {
            return;
        }

        if (recorder.seconds < 1) {
            setSaveError(
                "Запись должна длиться хотя бы одну секунду.",
            );
            return;
        }

        setSaving(true);
        setSaveError("");

        const currentAudioUrl = recorder.audioUrl;

        try {
            await history.saveSession({
                topicId: selectedTopic.id,
                topicTitle: selectedTopic.title,
                durationSeconds: Math.round(recorder.seconds),
                goalSeconds,
                rating,
                note: note.trim(),
            });

            setSavedAudioUrl(currentAudioUrl);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Не удалось сохранить выступление",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-7">
            {/* Заголовок */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <MessageCircle size={18} />
                    Практика публичных выступлений
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Свободная речь
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Учись говорить уверенно и последовательно.
                    Выбери тему, подготовься, запиши выступление
                    и оцени свой результат.
                </p>
            </div>

            {/* Выбор темы */}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">
                        Выбери тему выступления
                    </h2>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
            {TOPICS.length} тем
          </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {TOPICS.map((topic) => {
                        const selected =
                            selectedTopicId === topic.id;

                        return (
                            <button
                                key={topic.id}
                                type="button"
                                disabled={!canChangeSettings}
                                aria-pressed={selected}
                                onClick={() => changeTopic(topic.id)}
                                className={`rounded-2xl border p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                    selected
                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                                        : "border-gray-200 bg-white hover:border-violet-300 dark:border-white/10 dark:bg-[#151725]"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                                        <MessageCircle size={19} />
                                    </div>

                                    {selected && (
                                        <CheckCircle2
                                            size={21}
                                            className="text-violet-600"
                                        />
                                    )}
                                </div>

                                <h3 className="mt-4 text-sm font-semibold">
                                    {topic.title}
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                    {topic.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Основной блок */}
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    {/* Текущая тема */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725] sm:p-8">
                        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                            <Sparkles size={18} />
                            Твоя тема
                        </div>

                        <h2 className="text-2xl font-bold">
                            {selectedTopic.title}
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                            {selectedTopic.description}
                        </p>

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                            <Lightbulb
                                size={20}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <p className="text-sm leading-6 text-amber-900 dark:text-amber-200">
                                {selectedTopic.hint}
                            </p>
                        </div>
                    </section>

                    {/* Продолжительность */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <div className="mb-5 flex items-center gap-2">
                            <Clock3
                                size={20}
                                className="text-violet-600"
                            />

                            <h2 className="text-lg font-semibold">
                                Продолжительность выступления
                            </h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {GOALS.map((goal) => (
                                <button
                                    key={goal.value}
                                    type="button"
                                    disabled={!canChangeSettings}
                                    aria-pressed={goalSeconds === goal.value}
                                    onClick={() =>
                                        changeGoal(goal.value)
                                    }
                                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                        goalSeconds === goal.value
                                            ? "border-violet-600 bg-violet-600 text-white"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-violet-300 dark:border-white/10 dark:bg-[#10121E] dark:text-gray-300"
                                    }`}
                                >
                                    {goal.label}
                                </button>
                            ))}
                        </div>

                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Постарайся говорить в течение выбранного времени.
                            После записи ты сможешь оценить результат.
                        </p>
                    </section>

                    {/* Подготовка */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <h2 className="text-lg font-semibold">
                            Подготовка к выступлению
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            У тебя есть 30 секунд, чтобы продумать начало,
                            основные мысли и заключение.
                        </p>

                        {prepPhase === "idle" && (
                            <button
                                type="button"
                                onClick={startPreparation}
                                disabled={recorderBusy || hasRecording || saving}
                                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                                Начать подготовку
                                <ArrowRight size={17} />
                            </button>
                        )}

                        {prepPhase === "preparing" && (
                            <div className="mt-6 text-center">
                                <div className="text-5xl font-bold tracking-tight text-violet-600">
                                    {formatTime(prepSeconds)}
                                </div>

                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Продумай структуру своего ответа.
                                </p>

                                <button
                                    type="button"
                                    onClick={skipPreparation}
                                    className="mt-5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    Я готов, пропустить
                                </button>
                            </div>
                        )}

                        {prepPhase === "ready" && (
                            <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-500/10 dark:text-green-300">
                                <CheckCircle2 size={22} />

                                <p className="text-sm font-medium">
                                    Всё готово! Начинай запись голоса.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Самооценка */}
                    {hasRecording && (
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                            <h2 className="text-lg font-semibold">
                                Оцени своё выступление
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Прослушай запись и оцени, насколько уверенно
                                и понятно ты говорил.
                            </p>

                            <div className="mt-5 flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        disabled={isSaved || saving}
                                        aria-label={`Оценка ${value} из 5`}
                                        aria-pressed={rating === value}
                                        onClick={() => setRating(value)}
                                        className="rounded-lg p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                                    >
                                        <Star
                                            size={30}
                                            className={
                                                value <= rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                            }
                                        />
                                    </button>
                                ))}
                            </div>

                            <label
                                htmlFor="speaking-note"
                                className="mt-6 block text-sm font-semibold"
                            >
                                Заметки
                            </label>

                            <textarea
                                id="speaking-note"
                                rows={4}
                                maxLength={2000}
                                disabled={isSaved || saving}
                                value={note}
                                onChange={(event) =>
                                    setNote(event.target.value)
                                }
                                placeholder="Что получилось хорошо? Что нужно улучшить?"
                                className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E]"
                            />

                            {saveError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-red-500"
                                >
                                    {saveError}
                                </p>
                            )}

                            <button
                                type="button"
                                disabled={!rating || saving || isSaved}
                                onClick={() => void saveResult()}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Сохранение..."
                                    : isSaved
                                        ? "Результат сохранён ✓"
                                        : "Сохранить результат"}
                            </button>
                        </section>
                    )}
                </div>

                {/* Правая колонка */}
                <div className="space-y-4 xl:sticky xl:top-24">
                    <RecorderPanel
                        recorder={recorder}
                        disabledStart={
                            prepPhase !== "ready" ||
                            saving ||
                            isSaved
                        }
                    />

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                        <div className="flex items-center gap-2">
                            <Mic
                                size={18}
                                className="text-violet-600"
                            />

                            <h3 className="font-semibold">
                                Твоя цель
                            </h3>
                        </div>

                        <div className="mt-5 text-center">
                            <p className="text-4xl font-bold">
                                {formatTime(goalSeconds)}
                            </p>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Планируемое время
                            </p>
                        </div>

                        {hasRecording && (
                            <div className="mt-5 rounded-xl bg-violet-50 p-4 text-center dark:bg-violet-500/10">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Твоё выступление
                                </p>

                                <p className="mt-2 text-2xl font-bold text-violet-600 dark:text-violet-300">
                                    {formatTime(recorder.seconds)}
                                </p>
                            </div>
                        )}

                        {(hasRecording ||
                                prepPhase === "ready") &&
                            !recorderBusy && (
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={resetAttempt}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    <RotateCcw size={17} />
                                    Новая попытка
                                </button>
                            )}
                    </section>
                </div>
            </div>

            {/* История выступлений */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725] sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold">
                            История выступлений
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Твои результаты сохраняются в PostgreSQL.
                        </p>
                    </div>

                    <span className="rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            Всего: {history.sessions.length}
          </span>
                </div>

                {history.loading ? (
                    <p className="mt-6 text-sm text-gray-500">
                        Загружаем историю выступлений...
                    </p>
                ) : history.error ? (
                    <p
                        role="alert"
                        className="mt-6 text-sm text-red-500"
                    >
                        {history.error}
                    </p>
                ) : history.sessions.length === 0 ? (
                    <div className="mt-7 rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">
                        <Mic
                            size={32}
                            className="mx-auto text-gray-400"
                        />

                        <p className="mt-3 text-sm font-semibold">
                            Пока нет выступлений
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                            Запиши первое выступление и сохрани результат.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 divide-y divide-gray-100 dark:divide-white/10">
                        {history.sessions
                            .slice(0, 10)
                            .map((session) => (
                                <div
                                    key={session.id}
                                    className="flex flex-wrap items-center justify-between gap-4 py-5"
                                >
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {session.topicTitle}
                                        </h3>

                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(
                                                session.createdAt,
                                            ).toLocaleString("ru-RU")}
                                        </p>

                                        {session.note && (
                                            <p className="mt-2 max-w-lg text-sm text-gray-500 dark:text-gray-400">
                                                {session.note}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {formatTime(
                          session.durationSeconds,
                      )}
                    </span>

                                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star
                          size={16}
                          className="fill-current"
                      />
                                            {session.rating}/5
                    </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </section>
        </div>
    );
}
