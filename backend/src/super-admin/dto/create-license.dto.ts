import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateLicenseDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  userLimit: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  branchLimit: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationInDays: number;
}