import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert } from 'typeorm';
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

  // No banco, a coluna é VARCHAR NOT NULL (sem default).
  // Para evitar erro de NOT NULL, garantimos valor antes do insert.
  @Column({ type: 'varchar', nullable: false })
  status!: StatusAula;

  @Column({ type: 'timestamp', nullable: false })
  data_hora!: Date;

  @OneToMany(() => Reserva, reserva => reserva.aula)
  reservas!: Reserva[];

  @BeforeInsert()
  setDefaultStatus() {
    if (!this.status) {
      this.status = StatusAula.DISPONIVEL;
    }
  }
}