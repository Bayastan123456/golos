import { useEffect, useState } from "react";

import {
    dictionApi,
    type CreateDictionSession,
    type DictionSession,
} from "../api/dictionApi";
import {notifyProgressUpdated} from "../../progress/progressEvents.ts";

export function useDictionHistory() {
    const [sessions, setSessions] = useState<DictionSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const data = await dictionApi.getSessions(
                    controller.signal,
                );

                if (!controller.signal.aborted) {
                    setSessions(data);
                    setError(null);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError("Не удалось загрузить историю дикции");
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


    async function saveSession(data: CreateDictionSession) {
        const session = await dictionApi.createSession(data);

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
    };
}
