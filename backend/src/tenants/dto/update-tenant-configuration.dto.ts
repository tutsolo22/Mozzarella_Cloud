import {  
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsUrl,
  IsBoolean,
  Length,
  Matches,
  IsUppercase,
} from 'class-validator';

export class UpdateTenantConfigurationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  legalName?: string;

  @IsOptional()
  @IsString()
  @IsUppercase({ message: 'El RFC debe estar en mayúsculas.' })
  @Length(12, 13, { message: 'El RFC debe tener entre 12 y 13 caracteres.' })
  rfc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxRegime?: string;

  @IsOptional()
  @IsString()
  taxAddress?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'El teléfono de contacto debe contener 10 dígitos numéricos.' })
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'El teléfono del negocio debe contener 10 dígitos numéricos.' })
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  businessWhatsapp?: string;

  @IsOptional() @IsBoolean() branchesHaveSeparatePhones?: boolean;
  @IsOptional() @IsBoolean() branchesHaveSeparateWhatsapps?: boolean;

  @IsOptional() @IsUrl() @MaxLength(100) website?: string;
  @IsOptional() @IsUrl() @MaxLength(100) facebook?: string;
  @IsOptional() @IsUrl() @MaxLength(100) instagram?: string;
  @IsOptional() @IsUrl() @MaxLength(100) tiktok?: string;
}