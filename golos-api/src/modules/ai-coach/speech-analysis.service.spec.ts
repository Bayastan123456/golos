import { afterEach, describe, expect, it, vi } from 'vitest';
import { SpeechAnalysisService } from './speech-analysis.service.js';

afterEach(() => vi.unstubAllGlobals());

describe('SpeechAnalysisService coach feedback', () => {
  const dto = { text: 'Ну я я хочу рассказать о работе.', durationSeconds: 10 };
  it('returns model feedback and keeps calculated metrics', async () => {
    const feedback = {
      recommendations: ['Убери повтор «я».'],
      strength: 'Тема обозначена.',
      improvedText: 'Я хочу рассказать о работе.',
      exercise: 'Повтори фразу три раза без повтора.',
    };
    const request = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: { content: JSON.stringify(feedback) },
        }),
      ),
    );
    vi.stubGlobal('fetch', request);
    const result = await new SpeechAnalysisService().analyze(dto);
    expect(result.coach?.improvedText).toBe(feedback.improvedText);
    expect(result.recommendations).toEqual(feedback.recommendations);
    expect(result.repeatedWordCount).toBe(1);
    expect(JSON.parse(request.mock.calls[0][1].body).stream).toBe(false);
  });
  it.each(['offline', 'invalid'])(
    'returns explicit fallback when %s',
    async (mode) => {
      vi.stubGlobal(
        'fetch',
        mode === 'offline'
          ? vi.fn().mockRejectedValue(new Error('offline'))
          : vi
              .fn()
              .mockResolvedValue(
                new Response(JSON.stringify({ message: { content: '{}' } })),
              ),
      );
      const result = await new SpeechAnalysisService().analyze(dto);
      expect(result.coach).toBeUndefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.notice).toContain('Ollama недоступна');
    },
  );
});
