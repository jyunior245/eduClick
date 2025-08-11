import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Professor } from './Professor';
import { Reserva } from './Reserva';

export enum StatusAula {
  DISPONIVEL = 'disponivel',
  LOTADA = 'lotada',
  CANCELADA = 'cancelada',
  REAGENDADA = 'reagendada',
}

@Entity()
export class Aula {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Professor, professor => professor.aulas, { nullable: false })
  professor!: Professor;

  @Column({ nullable: false })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  conteudo?: string;

  @Column({ type: 'decimal', nullable: true })
  valor?: number;

  @Column({ type: 'int', nullable: true })
  duracao?: number;

  @Column({ nullable: false })
  vagas_total!: number;

  @Column({ default: 0 })
  vagas_ocupadas!: number;

  @Column({ type: 'enum', enum: StatusAula, default: StatusAula.DISPONIVEL })
  status!: StatusAula;

  @Column({ type: 'timestamp', nullable: false })
  data_hora!: Date;

  @OneToMany(() => Reserva, reserva => reserva.aula)
  reservas!: Reserva[];
}