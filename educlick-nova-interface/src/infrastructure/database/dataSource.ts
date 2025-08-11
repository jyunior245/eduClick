import { DataSource } from 'typeorm';
import { Usuario } from '../../server/entities/Usuario';
import { Aula } from '../../server/entities/Aula';
import { Reserva } from '../../server/entities/Reserva';
import { Aluno } from '../../server/entities/Aluno';
import { Log } from '../../server/entities/Log';
import { Professor } from '../../server/entities/Professor';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS || 'postgres';
const DB_NAME = process.env.DB_NAME || 'educlick';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [Professor, Usuario, Aula, Reserva, Aluno, Log],
  synchronize: true, // Cria tabelas automaticamente
  logging: false
});
