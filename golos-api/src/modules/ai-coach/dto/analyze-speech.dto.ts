import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AnalyzeSpeechDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  text!: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationSeconds!: number;
}
