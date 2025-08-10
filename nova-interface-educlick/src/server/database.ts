import { DataSource } from 'typeorm';
import path from 'path';

// Detecta se está rodando em produção (build) ou desenvolvimento
const isProd = __dirname.includes('dist');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'educlick',
  entities: [
    isProd
      ? path.join(__dirname, 'entities', '*.js')
      : path.join(__dirname, 'entities', '*.ts')
  ],
  synchronize: true,
});
