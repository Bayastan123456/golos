import {useState} from "react";

import {
    AudioLines,
    Bot,
    FileText,
    RotateCcw,
    Sparkles,
} from "lucide-react";

import RecorderPanel from "../features/diction/components/RecorderPanel";
import {useVoiceRecorder} from "../features/diction/hooks/useVoiceRecorder";

import {aiCoachApi, type SpeechAnalysisResult} from "../features/ai-coach/api/aiCoachApi";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const extensions: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
};

export default function AiCoachPage() {
    const recorder = useVoiceRecorder();

    const [processing, setProcessing] = useState(false);
    const [stage, setStage] = useState("");
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState("");

    const [analysis, setAnalysis] =
        useState<SpeechAnalysisResult | null>(null);

    const [analysisError, setAnalysisError] =
        useState("");

    const hasRecording = Boolean(recorder.audioUrl);

    async function handleTranscribe() {
        if (
            !recorder.audioUrl ||
            recorder.status !== "idle" ||
            processing
        ) {
            return;
        }

        setProcessing(true);
        setStage("Распознаём речь…");
        setError("");
        setTranscript("");
        setAnalysis(null);
        setAnalysisError("");

        try {
            // 1. Получаем записанное аудио.
            const response = await fetch(recorder.audioUrl);
            const blob = await response.blob();

            const mime = blob.type
                .split(";")[0]
                .trim()
                .toLowerCase();

            const extension = extensions[mime];

            if (!extension) {
                throw new Error(
                    "Формат аудио не поддерживается.",
                );
            }

            if (
                blob.size < 1024 ||
                blob.size > MAX_AUDIO_BYTES
            ) {
                throw new Error(
                    "Размер аудиофайла должен быть от 1 КБ до 10 МБ.",
                );
            }

            const file = new File(
                [blob],
                `speech.${extension}`,
                {type: mime},
            );

            // 2. Распознаём речь через whisper.cpp.
            const result = await aiCoachApi.transcribe(file);

            if (!result.text.trim()) {
                throw new Error(
                    "Не удалось распознать речь. Попробуй записать ещё раз.",
                );
            }

            setTranscript(result.text);
            setStage("ИИ-тренер готовит разбор и упражнение…");

            // 3. Анализируем распознанный текст.
            // Если анализ не сработает, сохраняем расшифровку.
            try {
                const report = await aiCoachApi.analyze(
                    result.text,
                    Math.max(1, Math.round(recorder.seconds)),
                );

                setAnalysis(report);
            } catch (err) {
                setAnalysisError(
                    err instanceof Error
                        ? err.message
                        : "Не удалось проанализировать речь.",
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось обработать запись.",
            );
        } finally {
            setProcessing(false);
        }
    }


    function reset() {
        if (
            processing ||
            recorder.status !== "idle"
        ) {
            return;
        }

        recorder.resetRecording();

        setTranscript("");
        setAnalysis(null);
        setAnalysisError("");
        setError("");
    }

    return (
        <div className="space-y-7">
            {/* Заголовок */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                    <Sparkles size={18}/>
                    Умный тренер речи
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    ИИ-тренер
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                    Запиши небольшой рассказ на любую тему.
                    ИИ-тренер
                    разберёт твою речь, предложит более ясную формулировку
                    и даст упражнение для следующей записи.
                </p>
            </div>

            {/* Пример темы */}
            <section
                className="rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div className="flex items-center gap-2 font-semibold text-violet-700 dark:text-violet-300">
                    <Bot size={21}/>
                    Задание от тренера
                </div>

                <h2 className="mt-4 text-xl font-bold">
                    Расскажи о своей главной цели
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    Что ты хочешь достичь в ближайший год?
                    Почему это важно для тебя?
                    Какие шаги ты уже предпринимаешь?
                </p>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Рекомендуемая продолжительность: 30–90 секунд.
                </p>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Информация */}
                <section
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                    <div className="flex items-center gap-2">
                        <AudioLines
                            size={21}
                            className="text-violet-600"
                        />

                        <h2 className="text-lg font-bold">
                            Как проходит тренировка
                        </h2>
                    </div>

                    <div className="mt-6 space-y-5">
                        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                            <strong>1.</strong> Запиши свой голос.
                            Говори естественно, как при обычном выступлении.
                        </p>

                        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                            <strong>2.</strong> Прослушай запись и убедись,
                            что речь хорошо слышна.
                        </p>

                        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                            <strong>3.</strong> Отправь аудио на распознавание
                            и получи текст, разбор и упражнение.
                        </p>
                    </div>

                    <p className="mt-6 rounded-xl bg-gray-50 p-4 text-xs leading-6 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                        При нажатии кнопки распознавания аудио
                        отправляется на наш сервер, обрабатывается Whisper и Ollama. Не записывай конфиденциальные
                        сведения.
                    </p>
                </section>

                {/* Запись */}
                <div className="space-y-4">
                    <RecorderPanel
                        recorder={recorder}
                        description="Расскажи о выбранной теме своими словами, затем прослушай запись."
                        disabledStart={processing}
                    />

                    {hasRecording && (
                        <div
                            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]">
                            <button
                                type="button"
                                disabled={
                                    processing ||
                                    recorder.status !== "idle"
                                }
                                onClick={() => void handleTranscribe()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Sparkles size={18}/>{
                                processing
                                    ? stage
                                    : "Распознать и проанализировать"}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    processing ||
                                    recorder.status !== "idle"
                                }
                                onClick={reset}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium dark:border-white/10"
                            >
                                <RotateCcw size={17}/>
                                Новая запись
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Ошибка */}
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10"
                >
                    {error}
                </div>
            )}

            {/* Распознанная речь */}
            {transcript && (
                <section
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725] sm:p-8">
                    <div className="flex items-center gap-3">
                        <FileText
                            size={22}
                            className="text-violet-600"
                        />

                        <h2 className="text-xl font-bold">
                            Текст твоего выступления
                        </h2>
                    </div>

                    <div className="mt-6 rounded-xl bg-gray-50 p-5 dark:bg-[#10121E]">
                        <p className="whitespace-pre-wrap text-sm leading-8 text-gray-700 dark:text-gray-200">
                            {transcript}
                        </p>
                    </div>

                    <p className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
                        Это автоматическая расшифровка.
                        Проверь текст: распознавание иногда ошибается.
                    </p>
                </section>
            )}

            {/* Ошибка анализа */}
            {analysisError && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10"
                >
                    {analysisError}
                </div>
            )}

            {/* Результаты анализа речи */}
            {analysis && (
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Анализ твоей речи
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Показатели рассчитаны по распознанному тексту
                            и длительности записи.
                        </p>
                    </div>

                    {/* Основные показатели */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                title: "Всего слов",
                                value: analysis.wordCount,
                                description: "В расшифровке",
                            },
                            {
                                title: "Средний темп",
                                value: analysis.wordsPerMinute,
                                description: "Слов в минуту",
                            },
                            {
                                title: "Слова-паразиты",
                                value: analysis.fillerCount,
                                description: "Возможных употреблений",
                            },
                            {
                                title: "Повторения",
                                value: analysis.repeatedWordCount,
                                description: "Соседних повторов",
                            },
                        ].map((stat) => (
                            <div
                                key={stat.title}
                                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#151725]"
                            >
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {stat.title}
                                </p>

                                <p className="mt-4 text-3xl font-bold text-violet-600 dark:text-violet-300">
                                    {stat.value}
                                </p>

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {stat.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Темп */}
                    <div
                        className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <h3 className="text-lg font-bold">
                            Темп речи
                        </h3>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            {analysis.pace === "fast"
                                ? "Средний темп высокий."
                                : analysis.pace === "slow"
                                    ? "Средний темп невысокий."
                                    : "Средний темп находится в выбранном ориентировочном диапазоне."}
                        </p>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {analysis.wordsPerMinute} слов/мин
                            за {analysis.durationSeconds} секунд записи.
                        </p>
                    </div>

                    {/* Найденные слова-паразиты */}
                    <div
                        className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <h3 className="text-lg font-bold">
                            Возможные слова-паразиты
                        </h3>

                        {analysis.fillers.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                В распознанном тексте не найдены выражения
                                из нашего словаря.
                            </p>
                        ) : (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {analysis.fillers.map((item) => (
                                    <span
                                        key={item.expression}
                                        className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                    >
              {item.expression} — {item.count}
            </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Повторы */}
                    <div
                        className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#151725]">
                        <h3 className="text-lg font-bold">
                            Повторения слов
                        </h3>

                        {analysis.repeatedWords.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Соседних повторов в расшифровке не найдено.
                            </p>
                        ) : (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {analysis.repeatedWords.map((item) => (
                                    <span
                                        key={item.word}
                                        className="rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                                    >
              {item.word} — {item.count}
            </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {analysis.coach && (
                        <div className="space-y-5 rounded-2xl border border-violet-200 bg-white p-6 dark:border-violet-500/20 dark:bg-[#151725]">
                            <h3 className="text-lg font-bold">Разбор ИИ-тренера</h3>
                            <div>
                                <h4 className="font-semibold">Что получилось хорошо</h4>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{analysis.coach.strength}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Как можно сказать яснее</h4>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{analysis.coach.improvedText}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Задание для следующей записи</h4>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{analysis.coach.exercise}</p>
                            </div>
                        </div>
                    )}

                    {/* Рекомендации */}
                    <div
                        className="rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-500/20 dark:bg-violet-500/10">
                        <h3 className="text-lg font-bold">
                            {analysis.coach ? "Персональные советы ИИ" : "Базовые советы — ответ ИИ не получен"}
                        </h3>

                        <ul className="mt-5 space-y-3">
                            {analysis.recommendations.map(
                                (recommendation, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-3 text-sm leading-7 text-gray-700 dark:text-gray-200"
                                    >
              <span className="font-bold text-violet-600">
                {index + 1}.
              </span>

                                        <span>{recommendation}</span>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>

                    <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
                        {analysis.notice}
                    </p>
                </section>
            )}

        </div>
    );
}
