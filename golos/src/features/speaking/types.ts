export type SpeakingDuration = 2 | 3 | 5;

export interface SpeakingTopic {
    id: string;
    title: string;
    description: string;
    category: string;
    questions: string[];
}

export interface SpeakingSession {
    id: string;
    topicId: string;
    topicTitle: string;
    durationSeconds: number;
    goalSeconds: number;
    rating: number;
    note: string;
    createdAt: string;
}
