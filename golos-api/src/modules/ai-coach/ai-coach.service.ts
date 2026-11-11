import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const AUDIO_FORMATS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
};

function validateAudioHeader(buffer: Buffer, mime: string): boolean {
  switch (mime) {
    case 'audio/webm':
      return buffer
        .subarray(0, 4)
        .equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));

    case 'audio/mp4':
      return buffer.toString('ascii', 4, 8) === 'ftyp';

    case 'audio/wav':
    case 'audio/x-wav':
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WAVE'
      );

    case 'audio/mpeg':
      return (
        buffer.toString('ascii', 0, 3) === 'ID3' ||
        (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
      );

    case 'audio/ogg':
      return buffer.toString('ascii', 0, 4) === 'OggS';

    default:
      return false;
  }
}

@Injectable()
export class AiCoachService {
  private readonly logger = new Logger(AiCoachService.name);

  async transcribe(
    file: Express.Multer.File | undefined,
  ): Promise<{ text: string }> {
    if (!file?.buffer || file.size < 1024 || file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException(
        'Аудиофайл отсутствует или имеет неверный размер',
      );
    }

    const mime = file.mimetype.split(';')[0].trim().toLowerCase();

    const extension = AUDIO_FORMATS[mime];

    if (!extension || !validateAudioHeader(file.buffer, mime)) {
      throw new BadRequestException('Неподдерживаемый формат аудио');
    }

    const formData = new FormData();

    const audioBlob = new Blob([new Uint8Array(file.buffer)], { type: mime });

    formData.append('file', audioBlob, `speech.${extension}`);

    formData.append('language', 'ru');
    formData.append('response_format', 'json');

    try {
      const response = await fetch(
        process.env.WHISPER_URL || 'http://127.0.0.1:8091/inference',
        {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(180_000),
        },
      );

      if (!response.ok) {
        this.logger.warn(`Whisper returned HTTP ${response.status}`);

        throw new BadGatewayException('Локальный ИИ не смог обработать запись');
      }

      const result: unknown = await response.json();

      if (
        !result ||
        typeof result !== 'object' ||
        !('text' in result) ||
        typeof result.text !== 'string'
      ) {
        throw new BadGatewayException('Некорректный ответ от Whisper');
      }

      return {
        text: result.text.trim(),
      };
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      this.logger.error(error instanceof Error ? error.message : String(error));

      throw new ServiceUnavailableException(
        'Локальный Whisper недоступен или не ответил вовремя',
      );
    }
  }
}
