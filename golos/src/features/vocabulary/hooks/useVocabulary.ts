import { useCallback, useEffect, useRef, useState } from "react";

import {
    vocabularyApi,
    type VocabularyWord,
    type WordProgress,
} from "../api/vocabularyApi";
import {notifyProgressUpdated} from "../../progress/progressEvents.ts";

export function useVocabulary() {
    const requestVersion = useRef(0);
    const [words, setWords] = useState<VocabularyWord[]>([]);

    const [progressByWordId, setProgressByWordId] =
        useState<Record<string, WordProgress>>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [savingWordId, setSavingWordId] =
        useState<string | null>(null);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            const version = ++requestVersion.current;
            return Promise.all([
                vocabularyApi.getWords(signal),
                vocabularyApi.getProgress(signal),
            ]).then(([wordsData, progressData]) => {

                if (signal?.aborted || version !== requestVersion.current) return;

                const progressMap: Record<string, WordProgress> = {};

                for (const item of progressData) {
                    progressMap[item.wordId] = item;
                }

                setWords(wordsData);
                setProgressByWordId(progressMap);
            }).catch((err: unknown) => {
                if (signal?.aborted || version !== requestVersion.current) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Не удалось загрузить словарь",
                );
            }).finally(() => {
                if (!signal?.aborted && version === requestVersion.current) {
                    setLoading(false);
                }
            });
        },
        [],
    );

    const cancelLoad = useCallback(() => {
        requestVersion.current++;
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        void load(controller.signal);

        return () => {
            controller.abort();
            cancelLoad();
        };
    }, [load, cancelLoad]);

    async function saveProgress(
        wordId: string,
        sentence: string,
        learned: boolean,
    ) {
        setSavingWordId(wordId);

        try {
            const result = await vocabularyApi.saveProgress(
                wordId,
                sentence,
                learned,
            );

            setProgressByWordId((previous) => ({
                ...previous,
                [wordId]: result,
            }));
            notifyProgressUpdated();

            return result;
        } finally {
            setSavingWordId(null);
        }
    }

    return {
        words,
        progressByWordId,
        loading,
        error,
        savingWordId,
        saveProgress,
        reload: () => {
            setLoading(true);
            setError(null);
            return load();
        },
    };
}
