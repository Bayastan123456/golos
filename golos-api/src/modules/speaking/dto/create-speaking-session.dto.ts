import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSpeakingSessionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  topicId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  topicTitle!: string;

  @IsInt()
  @Min(1)
  @Max(3600)
  durationSeconds!: number;

  @IsInt()
  @IsIn([120, 180, 300])
  goalSeconds!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
