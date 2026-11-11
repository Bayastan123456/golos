import { useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 600;
const MAX_RECORDING_BYTES = 10 * 1024 * 1024;

type RecorderStatus =
    | "idle"
    | "requesting"
    | "recording"
    | "processing";

function getErrorMessage(error: unknown): string {
    if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
            return "Доступ к микрофону запрещён. Разреши его в настройках браузера.";
        }

        if (error.name === "NotFoundError") {
            return "Микрофон не найден. Проверь подключение устройства.";
        }
    }

    return "Не удалось начать запись. Проверь микрофон и попробуй ещё раз.";
}

export function useVoiceRecorder() {
    const [status, setStatus] =
        useState<RecorderStatus>("idle");

    const [seconds, setSeconds] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const urlRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef(0);
    const requestPendingRef = useRef(false);
    const generationRef = useRef(0);

    useEffect(() => {
        generationRef.current += 1;

        return () => {
            generationRef.current += 1;

            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
            }

            const recorder = recorderRef.current;

            if (recorder && recorder.state !== "inactive") {
                recorder.onstop = null;
                recorder.ondataavailable = null;
                recorder.onerror = null;
                recorder.stop();
            }

            streamRef.current
                ?.getTracks()
                .forEach((track) => track.stop());

            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
            }
        };
    }, []);

    function resetRecording() {
        if (recorderRef.current || requestPendingRef.current) {
            return;
        }

        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }

        setAudioUrl(null);
        setSeconds(0);
        setError(null);
    }

    async function startRecording() {
        if (
            requestPendingRef.current ||
            recorderRef.current
        ) {
            return;
        }

        if (
            !navigator.mediaDevices?.getUserMedia ||
            typeof MediaRecorder === "undefined"
        ) {
            setError(
                "Запись недоступна. Открой сайт через localhost или HTTPS в поддерживаемом браузере."
            );
            return;
        }

        requestPendingRef.current = true;
        setError(null);
        setStatus("requesting");

        const generation = generationRef.current;
        let stream: MediaStream | null = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            if (generation !== generationRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            let totalBytes = 0;
            let oversized = false;

            streamRef.current = stream;
            recorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                totalBytes += event.data.size;
                if (totalBytes > MAX_RECORDING_BYTES) {
                    oversized = true;
                    chunks.length = 0;
                    if (recorder.state === "recording") stopRecording();
                    return;
                }
                if (!oversized && event.data.size > 0) chunks.push(event.data);
            };

            recorder.onerror = () => {
                if (generation === generationRef.current) {
                    setError("Произошла ошибка во время записи.");
                }
            };

            recorder.onstop = () => {
                if (timerRef.current !== null) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                stream?.getTracks().forEach((track) => track.stop());

                streamRef.current = null;
                recorderRef.current = null;

                if (generation !== generationRef.current) {
                    return;
                }

                if (oversized) {
                    setError("Запись превысила 10 МБ. Запиши более короткий рассказ.");
                    setStatus("idle");
                    return;
                }

                const blob = new Blob(chunks, {
                    type: recorder.mimeType || chunks[0]?.type || "",
                });

                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    urlRef.current = url;
                    setAudioUrl(url);
                } else {
                    setError("Запись получилась пустой. Попробуй ещё раз.");
                }

                setStatus("idle");
            };

            recorder.start(1000);

            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }

            setAudioUrl(null);
            setSeconds(0);
            setStatus("recording");

            startedAtRef.current = Date.now();

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
                setSeconds(Math.min(elapsed, MAX_RECORDING_SECONDS));
                if (elapsed >= MAX_RECORDING_SECONDS) stopRecording();
            }, 250);
        } catch (err) {
            stream?.getTracks().forEach((track) => track.stop());

            streamRef.current = null;
            recorderRef.current = null;

            if (generation === generationRef.current) {
                setError(getErrorMessage(err));
                setStatus("idle");
            }
        } finally {
            requestPendingRef.current = false;
        }
    }

    function stopRecording() {
        const recorder = recorderRef.current;

        if (!recorder || recorder.state !== "recording") {
            return;
        }

        setSeconds(
            Math.min(MAX_RECORDING_SECONDS, Math.floor(
                (Date.now() - startedAtRef.current) / 1000
            ))
        );

        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setStatus("processing");
        recorder.stop();
    }

    return {
        status,
        seconds,
        audioUrl,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    };
}

export type VoiceRecorderState =
    ReturnType<typeof useVoiceRecorder>;
