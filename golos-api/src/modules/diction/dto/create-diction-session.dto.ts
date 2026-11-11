import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDictionSessionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  exerciseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  exerciseTitle!: string;

  @IsInt()
  @Min(1)
  @Max(3600)
  durationSeconds!: number;
}
