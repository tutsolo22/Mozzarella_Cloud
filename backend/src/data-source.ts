import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno y permitir que sobreescriban las existentes.
// Esto es crucial para entornos como GitHub Codespaces.
config({ path: `.env.${process.env.NODE_ENV || 'development'}`, override: true });
config({ override: true }); // Cargar .env como fallback

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Usar DATABASE_URL si está disponible, si no, construirla con las otras variables
  url: process.env.DATABASE_URL,
  // Corregido para usar las variables del archivo .env local
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // NUNCA usar true en producción
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  subscribers: [],
} as DataSourceOptions);