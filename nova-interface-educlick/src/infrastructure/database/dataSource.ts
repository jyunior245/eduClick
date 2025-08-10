import { DataSource } from 'typeorm';
import { Usuario } from '../../server/entities/Usuario';
import { Aula } from '../../server/entities/Aula';
import { Reserva } from '../../server/entities/Reserva';
import { Aluno } from '../../server/entities/Aluno';
import { Log } from '../../server/entities/Log';
import { Professor } from '../../server/entities/Professor';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres', // Sua senha real
  database: 'educlick',
  entities: [Professor, Usuario, Aula, Reserva, Aluno, Log],
  synchronize: true, // Cria tabelas automaticamente
  logging: false
});
