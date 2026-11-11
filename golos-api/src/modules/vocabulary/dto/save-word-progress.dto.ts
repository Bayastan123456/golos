import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class SaveWordProgressDto {
  @IsString()
  @MaxLength(1000)
  sentence!: string;

  @IsBoolean()
  learned!: boolean;
}
