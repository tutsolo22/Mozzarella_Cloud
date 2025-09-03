import { IsInt, IsPositive, Max } from 'class-validator';

export class SetPreparationTimeDto {
  @IsInt({ message: 'El tiempo de preparación debe ser un número entero.' })
  @IsPositive({ message: 'El tiempo de preparación debe ser positivo.' })
  @Max(120, { message: 'El tiempo de preparación no puede exceder los 120 minutos.' })
  preparationTimeMinutes: number;
}