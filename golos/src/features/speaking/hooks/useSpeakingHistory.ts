import { useEffect, useState } from "react";

import {
    speakingApi,
    type CreateSpeakingSession,
} from "../api/speakingApi";

import type { SpeakingSession } from "../types";
import {notifyProgressUpdated} from "../../progress/progressEvents.ts";

export function useSpeakingHistory() {
    const [sessions, setSessions] =
        useState<SpeakingSession[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const data = await speakingApi.getSessions(
                    controller.signal,
                );

                if (!controller.signal.aborted) {
                    setSessions(data);
                    setError(null);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError("Не удалось загрузить выступления");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => controller.abort();
    }, []);

    async function saveSession(data: CreateSpeakingSession) {
        const session = await speakingApi.createSession(data);

        setSessions((previous) => [
            session,
            ...previous,
        ]);

        notifyProgressUpdated();

        return session;
    }


    return {
        sessions,
        loading,
        error,
        saveSession,
        totalSessions: sessions.length,
    };
}
