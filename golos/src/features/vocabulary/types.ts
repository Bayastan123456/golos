export interface VocabularyWord {
    id: string;
    word: string;
    meaning: string;
    example: string;
}

export interface WordProgress {
    sentence: string;
    learned: boolean;
    learnedAt?: string;
}
export type VocabularyProgress = Record<string, WordProgress>;
