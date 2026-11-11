import { apiRequest } from '../../../services/http';

export interface DailyActivity {
  date: string;
  diction: number;
  speaking: number;
  words: number;
  durationSeconds: number;
}

export interface ProgressSummary {
  totals: {
    dictionSessions: number;
    speakingSessions: number;
    totalSessions: number;
    learnedWords: number;
    vocabularyWords: number;
    totalTrainingSeconds: number;
    averageSpeakingRating: number | null;
  };

  activity: DailyActivity[];
}

export const progressApi = {
  getSummary(signal?: AbortSignal) {
    return apiRequest<ProgressSummary>('/progress/summary', { signal });
  },
};
