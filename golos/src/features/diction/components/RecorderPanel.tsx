import {
    Mic,
    Square,
    RotateCcw,
    Headphones,
    LoaderCircle,
} from "lucide-react";

import type { VoiceRecorderState } from "../hooks/useVoiceRecorder";

interface RecorderPanelProps {
    recorder: VoiceRecorderState;
    title?: string;
    description?: string;
    disabledStart?: boolean;
}


function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remaining
    ).padStart(2, "0")}`;
}

export default function RecorderPanel({
                                          recorder,
                                          title = "Запиши свою речь",
                                          description = "Прочитай скороговорку вслух, затем прослушай результат.",
                                          disabledStart = false,
                                      }: RecorderPanelProps) {
    const {
        status,
        seconds,
        audioUrl,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    } = recorder;

    const isRecording = status === "recording";
    const isBusy =
        status === "requesting" || status === "processing";

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-white/10 dark:bg-[#151725]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Mic size={27} />
            </div>

            <h2 className="text-xl font-bold">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
                {description}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                До 10 минут и 10 МБ. При достижении лимита запись остановится.
            </p>

            <p
                aria-live="off"
                className="mt-7 font-mono text-4xl font-semibold tabular-nums"
            >
                {formatTime(seconds)}
            </p>

            <p
                role="status"
                className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
                {status === "requesting" && "Получаем доступ к микрофону..."}
                {status === "recording" && "Идёт запись..."}
                {status === "processing" && "Обрабатываем запись..."}
                {status === "idle" && "Готов к тренировке"}
            </p>

            <div className="mt-6 flex justify-center">
                {isRecording ? (
                    <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600"
                    >
                        <Square size={18} fill="currentColor" />
                        Остановить
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={isBusy || disabledStart}
                        onClick={() => void startRecording()}
                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isBusy ? (
                            <LoaderCircle
                                size={19}
                                className="animate-spin"
                            />
                        ) : (
                            <Mic size={19} />
                        )}

                        {isBusy ? "Подождите..." : "Начать запись"}
                    </button>
                )}
            </div>

            {error && (
                <p role="alert" className="mt-4 text-sm text-red-500">
                    {error}
                </p>
            )}

            {audioUrl && (
                <div className="mt-7 rounded-xl bg-gray-50 p-4 text-left dark:bg-white/5">
                    <div className="mb-3 flex items-center gap-2">
                        <Headphones size={18} className="text-violet-500" />
                        <span className="text-sm font-semibold">
              Твоя запись
            </span>
                    </div>

                    <audio
                        controls
                        src={audioUrl}
                        aria-label="Прослушать запись речи"
                        className="w-full"
                    />

                    <button
                        type="button"
                        onClick={resetRecording}
                        className="mt-4 flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-300"
                    >
                        <RotateCcw size={16} />
                        Удалить запись
                    </button>
                </div>
            )}
        </section>
    );
}
