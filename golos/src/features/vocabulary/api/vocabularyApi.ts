import { apiRequest } from "../../../services/http";

export type WordLevel = "EASY" | "MEDIUM" | "HARD";

export interface VocabularyWord {
    id: string;
    word: string;
    meaning: string;
    example: string;
    level: WordLevel;
}

export interface WordProgress {
    wordId: string;
    sentence: string;
    learned: boolean;
    learnedAt: string | null;
    updatedAt: string;
}

export const vocabularyApi = {
    // Получение каталога слов
    getWords(signal?: AbortSignal) {
        return apiRequest<VocabularyWord[]>(
            "/vocabulary/words",
            { signal },
        );
    },

    // Получение личного прогресса
    getProgress(signal?: AbortSignal) {
        return apiRequest<WordProgress[]>(
            "/vocabulary/progress",
            { signal },
        );
    },

    // Сохранение предложения и статуса изучения
    saveProgress(
        wordId: string,
        sentence: string,
        learned: boolean,
    ) {
        return apiRequest<WordProgress>(
            `/vocabulary/words/${encodeURIComponent(wordId)}/progress`,
            {
                method: "PUT",
                body: JSON.stringify({
                    sentence,
                    learned,
                }),
            },
        );
    },
};
