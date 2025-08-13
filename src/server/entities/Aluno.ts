import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './Usuario';
import { Reserva } from './Reserva';

@Entity()
export class Aluno {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Usuario, { nullable: false })
  @JoinColumn()
  usuario!: Usuario;

  @OneToMany(() => Reserva, reserva => reserva.aluno)
  reservas!: Reserva[];
}