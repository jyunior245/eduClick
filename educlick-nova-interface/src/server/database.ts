import { DataSource } from 'typeorm';
import path from 'path';

// Detecta se está rodando em produção (build) ou desenvolvimento
const isProd = __dirname.includes('dist');

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [
    isProd
      ? path.join(__dirname, 'entities', '*.js')
      : path.join(__dirname, 'entities', '*.ts')
  ],
  synchronize: true,
});
