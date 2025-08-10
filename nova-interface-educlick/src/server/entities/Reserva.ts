import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Aula } from './Aula';
import { Aluno } from './Aluno';

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Aula, aula => aula.reservas)
  aula!: Aula;

  @ManyToOne(() => Aluno, aluno => aluno.reservas)
  aluno!: Aluno;


  @Column()
  status!: string; // 'ativa', 'cancelada'

  @Column({ nullable: true })
  telefone?: string;

  @Column()
  data_reserva!: Date;

  @Column({ nullable: true })
  data_cancelamento?: Date;
}