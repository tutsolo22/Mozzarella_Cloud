import { IsInt, Min } from 'class-validator';

export class GenerateLicenseDto {
  @IsInt()
  @Min(1)
  userLimit: number;

  @IsInt()
  @Min(1)
  branchLimit: number;

  @IsInt()
  @Min(1)
  durationInDays: number;
}