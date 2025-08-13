import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Usuario } from '../../server/entities/Usuario';
import { Aula } from '../../server/entities/Aula';
import { Reserva } from '../../server/entities/Reserva';
import { Aluno } from '../../server/entities/Aluno';
import { Log } from '../../server/entities/Log';
import { Professor } from '../../server/entities/Professor';

// Preferir variáveis de ambiente. NÃO definir credenciais padrão no código.
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DATABASE_URL = process.env.DATABASE_URL;

// Monta a configuração priorizando DATABASE_URL; caso contrário, usa campos individuais.
const baseConfig = DATABASE_URL
  ? { url: DATABASE_URL }
  : {
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
    };

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(baseConfig as any),
  entities: [Professor, Usuario, Aula, Reserva, Aluno, Log],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
});
