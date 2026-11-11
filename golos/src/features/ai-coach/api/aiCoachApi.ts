import { apiRequest } from "../../../services/http";

export interface TranscriptionResult {
    text: string;
}

export type SpeechPace =
    | "slow"
    | "moderate"
    | "fast";

export interface SpeechAnalysisResult {
    coach?: {
        strength: string;
        improvedText: string;
        exercise: string;
    };

    wordCount: number;
    durationSeconds: number;
    wordsPerMinute: number;
    pace: SpeechPace;

    fillerCount: number;
    fillers: {
        expression: string;
        count: number;
    }[];

    repeatedWordCount: number;
    repeatedWords: {
        word: string;
        count: number;
    }[];

    recommendations: string[];
    notice: string;
}

export const aiCoachApi = {
    transcribe(audio: File) {
        const formData = new FormData();

        formData.append("audio", audio);

        return apiRequest<TranscriptionResult>(
            "/ai-coach/transcribe",
            {
                method: "POST",
                body: formData,
            },
        );
    },

    analyze(
        text: string,
        durationSeconds: number,
    ) {
        return apiRequest<SpeechAnalysisResult>(
            "/ai-coach/analyze",
            {
                method: "POST",
                body: JSON.stringify({
                    text,
                    durationSeconds,
                }),
            },
        );
    },
};
