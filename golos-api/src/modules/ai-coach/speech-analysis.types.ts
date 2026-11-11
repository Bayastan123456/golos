export type SpeechPace = 'slow' | 'moderate' | 'fast';

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
